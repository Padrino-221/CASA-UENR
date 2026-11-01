import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { canManageAttendance, canViewAdministrativeData, isLocalScope } from '@/lib/roles';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !canManageAttendance(session.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { sessionId, studentIds, checkInMethod } = await request.json();

    if (!sessionId || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: 'Missing sessionId or studentIds array' }, { status: 400 });
    }

    // Verify session belongs to admin's chapter
    const attendanceSession = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      select: { chapterId: true }
    });

    if (!attendanceSession || attendanceSession.chapterId !== session.user.chapterId) {
      return NextResponse.json({ error: 'Unauthorized session access' }, { status: 403 });
    }

    const uniqueIds = [...new Set(studentIds)];
    if (uniqueIds.some((id) => typeof id !== 'string') || uniqueIds.length > 1000) {
      return NextResponse.json({ error: 'Invalid student IDs' }, { status: 400 });
    }
    const members = await db.student.count({ where: { id: { in: uniqueIds }, chapterId: attendanceSession.chapterId } });
    if (members !== uniqueIds.length) {
      return NextResponse.json({ error: 'Students must belong to your chapter' }, { status: 403 });
    }
    // Commit the complete batch atomically.

    const records = await db.$transaction(async (tx) => {
      const results = [];
      for (const studentId of uniqueIds) {
        results.push(await tx.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId
            }
          },
          update: {
            checkInMethod: checkInMethod || 'MANUAL'
          },
          create: {
            sessionId,
            studentId,
            checkInMethod: checkInMethod || 'MANUAL'
          }
        }));
      }
      return results;
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (err) {
    console.error('Attendance marking error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Special GET to see who is present in a session
export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!canViewAdministrativeData(session.user?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  try {
    const records = await db.attendanceRecord.findMany({
      where: { sessionId, session: {
        ...(isLocalScope(session.user.role) ? { chapterId: session.user.chapterId || 'none' } : {}),
        ...(session.user.role === 'REGIONAL_ADMIN' ? { chapter: { regionId: session.user.regionId || 'none' } } : {}),
      } },
      include: {
        student: {
          select: { id: true, name: true, studentId: true }
        }
      }
    });

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session || !canManageAttendance(session.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { sessionId, studentId } = await request.json();

    if (!sessionId || !studentId) {
      return NextResponse.json({ error: 'Missing sessionId or studentId' }, { status: 400 });
    }

    // Verify session belongs to admin's chapter
    const attendanceSession = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      select: { chapterId: true }
    });

    if (!attendanceSession || attendanceSession.chapterId !== session.user.chapterId) {
      return NextResponse.json({ error: 'Unauthorized session access' }, { status: 403 });
    }

    await db.attendanceRecord.delete({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Attendance unmarking error:', err);
    return NextResponse.json({ error: 'Failed to remove attendance record' }, { status: 500 });
  }
}
