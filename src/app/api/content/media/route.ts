import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { deleteObject } from '@/lib/storage';

export async function GET() {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(assets);
}

export async function DELETE(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (asset.storageKey) {
    await deleteObject(asset.storageKey).catch((err) => {
      console.error('Failed to delete storage object:', err);
    });
  } else if (asset.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', asset.url.replace(/^\//, ''));
    await unlink(filePath).catch(() => {});
  }
  await db.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
