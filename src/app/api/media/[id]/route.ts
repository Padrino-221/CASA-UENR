import { db } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset || !asset.data) {
    return new Response('Not found', { status: 404 });
  }

  const bytes = Buffer.from(asset.data);
  return new Response(bytes, {
    headers: {
      'Content-Type': asset.mimeType || 'application/octet-stream',
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
