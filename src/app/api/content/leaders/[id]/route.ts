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
    const name = String(data.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const leader = await db.siteLeader.update({
      where: { id },
      data: {
        name,
        role: String(data.role || ''),
        bio: String(data.bio || ''),
        initials: String(data.initials || ''),
        color: String(data.color || 'brand'),
        imageUrl: data.imageUrl ? String(data.imageUrl) : null,
        published: data.published === undefined ? true : Boolean(data.published),
        order: Number(data.order) || 0,
      },
    });

    await createAuditLog({
      userId: session.user.id as string,
      action: 'UPDATE',
      entity: 'SITE_LEADER',
      entityId: leader.id,
      metadata: { name: leader.name },
    });

    return NextResponse.json(leader);
  } catch (err) {
    console.error('Leader update error:', err);
    return NextResponse.json({ error: 'Failed to update leader' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await db.siteLeader.delete({ where: { id } });
    await createAuditLog({
      userId: session.user.id as string,
      action: 'DELETE',
      entity: 'SITE_LEADER',
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Leader delete error:', err);
    return NextResponse.json({ error: 'Failed to delete leader' }, { status: 500 });
  }
}
