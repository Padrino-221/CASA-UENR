import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { isStorageConfigured, uploadObject } from '@/lib/storage';

export const runtime = 'nodejs';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
const RASTER_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

function extFor(mimeType: string): string {
  switch (mimeType) {
    case 'image/webp':
      return '.webp';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '.jpg';
  }
}

export async function POST(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    let output: Uint8Array = bytes;
    let mimeType = file.type;

    // Compress and normalise raster images: auto-orient, cap width, convert to WebP.
    // SVG (vector) and GIF (animation) are stored as-is.
    if (RASTER_TYPES.includes(file.type)) {
      try {
        output = await sharp(bytes)
          .rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        mimeType = 'image/webp';
      } catch {
        return NextResponse.json({ error: 'Could not process image' }, { status: 400 });
      }
    }

    const uploadedById = session.user.id as string;

    // Preferred path: Neon object storage (S3-compatible), public URL.
    if (isStorageConfigured()) {
      const key = `cms/${randomUUID()}${extFor(mimeType)}`;
      const url = await uploadObject(key, output, mimeType);

      const asset = await db.mediaAsset.create({
        data: {
          filename: file.name,
          url,
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
    }

    // Fallback: persist the bytes in the database and serve via /api/media/[id].
    const created = await db.mediaAsset.create({
      data: {
        filename: file.name,
        url: '',
        mimeType,
        size: output.length,
        data: output,
        uploadedById,
      },
    });

    const asset = await db.mediaAsset.update({
      where: { id: created.id },
      data: { url: `/api/media/${created.id}` },
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
