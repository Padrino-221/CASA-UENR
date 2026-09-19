import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope } from '@/lib/roles';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const attendanceSession = await db.attendanceSession.findUnique({
      where: { id },
      include: {
        chapter: true,
        _count: {
          select: { records: true }
        }
      }
    });

    if (!attendanceSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(attendanceSession);
  } catch (err) {
    console.error('Fetch attendance session error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const existingSession = await db.attendanceSession.findUnique({
      where: { id },
      select: { chapterId: true }
    });
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (isLocalScope(session.user?.role) && existingSession.chapterId !== session.user?.chapterId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      totalAttendance, 
      totalMales, 
      totalFemales, 
      speaker, 
      topic, 
      challenges, 
      attitudeOfExecutives, 
      remarks 
    } = body;

    const parseCount = (val: unknown): number | null | undefined => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      const n = Number(val);
      if (!Number.isInteger(n) || n < 0) throw new Error('INVALID_COUNT');
      return n;
    };

    const parsedAttendance = parseCount(totalAttendance);
    const parsedMales = parseCount(totalMales);
    const parsedFemales = parseCount(totalFemales);

    const updatedSession = await db.attendanceSession.update({
      where: { id },
      data: {
        totalAttendance: parsedAttendance,
        totalMales: parsedMales,
        totalFemales: parsedFemales,
        speaker: speaker !== undefined ? speaker : undefined,
        topic: topic !== undefined ? topic : undefined,
        challenges: challenges !== undefined ? challenges : undefined,
        attitudeOfExecutives: attitudeOfExecutives !== undefined ? attitudeOfExecutives : undefined,
        remarks: remarks !== undefined ? remarks : undefined
      }
    });

    return NextResponse.json(updatedSession);
  } catch (err) {
    console.error('Update attendance session error:', err);
    if (err instanceof Error && err.message === 'INVALID_COUNT') {
      return NextResponse.json({ error: 'Attendance counts must be non-negative integers' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
