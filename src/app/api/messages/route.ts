import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getSecretarySession } from '@/lib/secretary';
export async function GET(request: Request) {
  const session = await getSecretarySession();
  if (!session) return NextResponse.json({ error: 'Secretary access required' }, { status: 403 });
  const chapterId = session.user.chapterId!;
  const rawPage = Number(new URL(request.url).searchParams.get('page') || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [messages, total, unread] = await Promise.all([
    db.contactMessage.findMany({ where: { chapterId }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 30, take: 30 }),
    db.contactMessage.count({ where: { chapterId } }),
    db.contactMessage.count({ where: { chapterId, status: 'NEW' } }),
  ]);
  return NextResponse.json({ messages, total, unread, page });
}
export async function PATCH(request: Request) {
  const session = await getSecretarySession();
  if (!session) return NextResponse.json({ error: 'Secretary access required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== 'string' || !['NEW', 'READ', 'ARCHIVED'].includes(body.status)) return NextResponse.json({ error: 'Invalid message update' }, { status: 400 });
  const result = await db.contactMessage.updateMany({ where: { id: body.id, chapterId: session.user.chapterId! }, data: { status: body.status } });
  return result.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Message not found' }, { status: 404 });
}
