import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getSecretarySession } from '@/lib/secretary';
import { normalisePhone, smsConfiguration, smsSegments } from '@/lib/sms';

export async function GET() {
  const session = await getSecretarySession();
  if (!session) return NextResponse.json({ error: 'Secretary access required' }, { status: 403 });
  const chapterId = session.user.chapterId!;
  const [announcements, members] = await Promise.all([
    db.announcement.findMany({ where: { chapterId }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, title: true, message: true, sender: true, audience: true, recipientCount: true, skippedCount: true, status: true, error: true, createdAt: true, sentAt: true } }),
    db.student.findMany({ where: { chapterId, status: 'ACTIVE' }, orderBy: { name: 'asc' }, take: 1000, select: { id: true, name: true, phone: true, isLeader: true } }),
  ]);
  return NextResponse.json({ announcements, members, ...smsConfiguration() });
}

export async function POST(request: Request) {
  const session = await getSecretarySession();
  if (!session) return NextResponse.json({ error: 'Secretary access required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const audience = body?.audience;
  if (!title || title.length > 100 || !message || message.length > 1600 || !['ACTIVE_MEMBERS', 'LEADERS', 'SELECTED'].includes(audience)) return NextResponse.json({ error: 'Enter a title and message of up to 1,600 characters, and choose an audience.' }, { status: 400 });
  const studentIds = Array.isArray(body.studentIds) ? [...new Set(body.studentIds.filter((id: unknown) => typeof id === 'string'))] as string[] : [];
  if (audience === 'SELECTED' && (!studentIds.length || studentIds.length > 1000)) return NextResponse.json({ error: 'Select between 1 and 1,000 chapter members.' }, { status: 400 });
  const members = await db.student.findMany({ where: { chapterId: session.user.chapterId!, status: 'ACTIVE', ...(audience === 'LEADERS' ? { isLeader: true } : {}), ...(audience === 'SELECTED' ? { id: { in: studentIds } } : {}) }, select: { id: true, phone: true }, take: 1001 });
  if (audience === 'SELECTED' && members.length !== studentIds.length) return NextResponse.json({ error: 'Choose active members from your own chapter only.' }, { status: 403 });
  if (members.length > 1000) return NextResponse.json({ error: 'Choose up to 1,000 members per announcement.' }, { status: 400 });
  const phones = members.map(member => normalisePhone(member.phone));
  const recipients = [...new Set(phones.filter((phone): phone is string => Boolean(phone)))];
  if (!recipients.length) return NextResponse.json({ error: 'No valid phone numbers in this audience. Update member phone numbers first.' }, { status: 400 });
  const config = smsConfiguration();
  const draft = await db.announcement.create({ data: { chapterId: session.user.chapterId!, authorId: session.user.id, title, message, sender: config.sender, audience, recipients, recipientCount: recipients.length, skippedCount: members.length - recipients.length } });
  return NextResponse.json({ id: draft.id, title, message, sender: draft.sender, recipientCount: draft.recipientCount, skippedCount: draft.skippedCount, configured: config.configured, ...smsSegments(message) }, { status: 201 });
}
