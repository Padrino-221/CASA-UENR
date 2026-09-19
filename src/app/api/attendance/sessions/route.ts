import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope, canManageAttendance } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');

  const role = session.user?.role;
  if (!role) {
    return NextResponse.json({ error: 'Forbidden: Role could not be determined.' }, { status: 403 });
  }
  const contextId = role === 'REGIONAL_ADMIN' ? session.user?.regionId : session.user?.chapterId;

  try {
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const sessions = await db.attendanceSession.findMany({
      where: {
        AND: [
          chapterId ? { chapterId } : {},
          isLocalScope(role) ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
        ]
      },
      include: {
        chapter: true,
        _count: {
          select: { records: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    });
    return NextResponse.json(sessions);
  } catch (err) {
    console.error('Attendance fetch error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !canManageAttendance(session.user?.role)) {
    return NextResponse.json({ error: 'Only local admins can create sessions' }, { status: 403 });
  }

  try {
    const { serviceType, title, date } = await request.json();
    const chapterId = session.user.chapterId;

    if (!serviceType || !chapterId) {
      return NextResponse.json({ error: 'Missing serviceType or chapter context' }, { status: 400 });
    }

    const attendanceSession = await db.attendanceSession.create({
      data: {
        serviceType,
        title,
        date: date ? new Date(date) : new Date(),
        chapterId
      }
    });

    return NextResponse.json(attendanceSession, { status: 201 });
  } catch (err) {
    console.error('Attendance session creation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
