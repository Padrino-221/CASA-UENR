import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { compressMediaImage, MAX_IMAGE_UPLOAD_BYTES } from '@/lib/media-image';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { isStorageConfigured, uploadObject } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.size) return NextResponse.json({ error: 'The selected image is empty' }, { status: 400 });
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'This image exceeds the 100 MB upload limit. Please choose a smaller source file.' }, { status: 413 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    try {
      output = await compressMediaImage(bytes);
    } catch {
      return NextResponse.json({ error: 'Could not read this image. Use a valid JPG, PNG, WebP, GIF, SVG, AVIF or TIFF image (up to 100 megapixels).' }, { status: 400 });
    }
    const mimeType = 'image/webp';
    const filename = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`;

    const uploadedById = session.user.id as string;

    // Keep readable bytes locally even when also backing up to object storage.
    if (isStorageConfigured()) {
      try {
      const key = `cms/${randomUUID()}.webp`;
      await uploadObject(key, output, mimeType);
      const mediaId = randomUUID();

      const asset = await db.mediaAsset.create({
        data: {
          id: mediaId,
          filename,
          url: `/api/media/${mediaId}`,
          data: new Uint8Array(output),
          storageKey: key,
          mimeType,
          size: output.length,
          uploadedById,
        },
      });

      return NextResponse.json(
        {
          id: asset.id,
          filename: asset.filename,
          url: asset.url,
          mimeType: asset.mimeType,
          size: asset.size,
          createdAt: asset.createdAt,
        },
        { status: 201 }
      );
      } catch {
        // Storage outages must not prevent editors from uploading images.
        console.warn('CMS object storage unavailable; saving image in the database.');
      }
    }

    // Fallback: persist the bytes in the database and serve via /api/media/[id].
    const mediaId = randomUUID();
    const asset = await db.mediaAsset.create({
      data: {
        id: mediaId,
        filename,
        url: `/api/media/${mediaId}`,
        mimeType,
        size: output.length,
        data: new Uint8Array(output),
        uploadedById,
      },
    });


    return NextResponse.json(
      {
        id: asset.id,
        filename: asset.filename,
        url: asset.url,
        mimeType: asset.mimeType,
        size: asset.size,
        createdAt: asset.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Media upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
