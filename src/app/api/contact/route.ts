import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

const requests = new Map<string, { count: number; reset: number }>();
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 12000) return NextResponse.json({ error: 'Your message is too long.' }, { status: 413 });
    const body = JSON.parse(text);
    if (body.website) return NextResponse.json({ ok: true });
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !topic || topic.length > 100 || !message || message.length > 5000) {
      return NextResponse.json({ error: 'Enter your name, a valid email address, and a message of up to 5,000 characters.' }, { status: 400 });
    }
    const chapterId = process.env.SITE_CHAPTER_ID;
    if (!chapterId || !await db.chapter.findUnique({ where: { id: chapterId }, select: { id: true } })) return NextResponse.json({ error: 'Messaging is temporarily unavailable. Please contact the fellowship by email.' }, { status: 503 });
    const now = Date.now();
    for (const [key, value] of requests) if (value.reset < now) requests.delete(key);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const recent = requests.get(ip);
    if (recent && recent.count >= 5) return NextResponse.json({ error: 'You have sent several messages. Please try again in 10 minutes.' }, { status: 429, headers: { 'Retry-After': '600' } });
    requests.set(ip, { count: (recent?.count || 0) + 1, reset: recent?.reset || now + 600000 });
    await db.contactMessage.create({ data: { chapterId, name, email, topic, message } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 400 }); }
}
