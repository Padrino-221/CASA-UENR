import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { createAuditLog } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const data = await request.json();
    const title = String(data.title || '').trim();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const event = await db.siteEvent.update({
      where: { id },
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
      action: 'UPDATE',
      entity: 'SITE_EVENT',
      entityId: event.id,
      metadata: { title: event.title },
    });

    return NextResponse.json(event);
  } catch (err) {
    console.error('Event update error:', err);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await db.siteEvent.delete({ where: { id } });
    await createAuditLog({
      userId: session.user.id as string,
      action: 'DELETE',
      entity: 'SITE_EVENT',
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Event delete error:', err);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
