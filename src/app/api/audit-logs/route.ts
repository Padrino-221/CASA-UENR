import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user?.role;
  const regionId = session.user?.regionId;
  const chapterId = session.user?.chapterId;

  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get('skip') || '0');
  const take = parseInt(searchParams.get('take') || '20');

  try {
    const where: Record<string, unknown> = {};

    // Apply jurisdictional filters
    if (role === 'REGIONAL_ADMIN' && regionId) {
      where.user = { 
        OR: [
          { regionId },
          { chapter: { regionId } }
        ]
      };
    } else if (role === 'LOCAL_ADMIN' && chapterId) {
      where.user = { chapterId };
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      db.auditLog.count({ where })
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Audit Log fetch error:', error);
    return NextResponse.json({ error: 'Failed to synchronize activity records' }, { status: 500 });
  }
}
