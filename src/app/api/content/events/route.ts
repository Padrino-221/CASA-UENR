import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await db.siteEvent.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const title = String(data.title || '').trim();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const event = await db.siteEvent.create({
      data: {
        month: String(data.month || ''),
        day: String(data.day || ''),
        kind: String(data.kind || 'Event'),
        title,
        text: String(data.text || ''),
        meta: data.meta ? String(data.meta) : null,
        published: data.published === undefined ? true : Boolean(data.published),
        order: Number(data.order) || 0,
      },
    });

    await createAuditLog({
      userId: session.user.id as string,
      action: 'CREATE',
      entity: 'SITE_EVENT',
      entityId: event.id,
      metadata: { title: event.title },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error('Event create error:', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
