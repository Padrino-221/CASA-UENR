import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope } from '@/lib/roles';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user?.role;
  const regionId = session.user?.regionId;
  const chapterId = session.user?.chapterId;

  try {
    // 1. Fetch recent transactions
    const transactions = await db.transaction.findMany({
      where: {
        AND: [
          isLocalScope(role) ? { chapterId: chapterId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: regionId || 'none' } } : {},
        ]
      },
      include: { chapter: { select: { name: true } } },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch recent events
    const events = await db.event.findMany({
      where: {
        OR: [
          { scope: 'NATIONAL' },
          role === 'REGIONAL_ADMIN' ? { regionId: regionId || 'none' } : {},
          isLocalScope(role) ? { chapterId: chapterId || 'none' } : {},
        ]
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    const notifications = [
      ...transactions.map((t: { id: string; category: string; amount: number; type: string; chapter: { name: string }; createdAt: Date }) => ({
        id: t.id,
        type: 'FINANCE',
        title: `Financial Entry: ${t.category}`,
        subtitle: `GH₵ ${t.amount.toLocaleString()} ${t.type.toLowerCase()} at ${t.chapter?.name ?? 'Unassigned'}`,
        time: t.createdAt,
        url: '/collections'
      })),
      ...events.map((e: { id: string; title: string; category: string; scope: string; createdAt: Date }) => ({
        id: e.id,
        type: 'EVENT',
        title: `Calendar: ${e.title}`,
        subtitle: `New ${e.category} broadcasted to ${e.scope.toLowerCase()} scope`,
        time: e.createdAt,
        url: '/events'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    return NextResponse.json(notifications);
  } catch (err) {
    console.error('Notifications fetch error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
