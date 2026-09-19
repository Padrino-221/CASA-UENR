import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getContentSession } from '@/lib/cms/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leaders = await db.siteLeader.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  return NextResponse.json(leaders);
}

export async function POST(request: Request) {
  const session = await getContentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const name = String(data.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const leader = await db.siteLeader.create({
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
      action: 'CREATE',
      entity: 'SITE_LEADER',
      entityId: leader.id,
      metadata: { name: leader.name },
    });

    return NextResponse.json(leader, { status: 201 });
  } catch (err) {
    console.error('Leader create error:', err);
    return NextResponse.json({ error: 'Failed to create leader' }, { status: 500 });
  }
}
