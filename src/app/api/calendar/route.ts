import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope, canManageCalendar } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filterChapterId = searchParams.get('chapterId');

  try {
    const role = session.user?.role;
    const chapterId = session.user?.chapterId;
    const regionId = session.user?.regionId;

    let academicYears = [];

    if (isLocalScope(role)) {
      // Local admin sees only their chapter's academic years
      academicYears = await db.academicYear.findMany({
        where: { chapterId: chapterId || 'none' },
        include: { semesters: true },
        orderBy: { startDate: 'desc' }
      });
    } else if (role === 'REGIONAL_ADMIN') {
      // Regional admin sees all years across their chapters, optionally filtered by a specific chapter
      academicYears = await db.academicYear.findMany({
        where: { 
          chapter: { 
            regionId: regionId || 'none',
            ...(filterChapterId ? { id: filterChapterId } : {})
          } 
        },
        include: { semesters: true, chapter: { select: { name: true } } },
        orderBy: { startDate: 'desc' }
      });
    } else {
      // National admin sees all years across all chapters
      academicYears = await db.academicYear.findMany({
        where: filterChapterId ? { chapterId: filterChapterId } : {},
        include: { semesters: true, chapter: { select: { name: true } } },
        orderBy: { startDate: 'desc' }
      });
    }

    return NextResponse.json(academicYears);
  } catch (err) {
    console.error('Calendar fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user?.role;
  // National/local admins and secretaries can manage the calendar; regional is read-only.
  if (role === 'REGIONAL_ADMIN' || !(role === 'NATIONAL_ADMIN' || canManageCalendar(role))) {
    return NextResponse.json({ error: 'Forbidden: You cannot modify academic calendars' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, semesterId, yearId, name, startDate, endDate } = body;

    if (action === 'TOGGLE_STATUS') {
      const semester = await db.semester.findUnique({ where: { id: semesterId } });
      if (!semester) return NextResponse.json({ error: 'Semester not found' }, { status: 404 });

      // Enforce local admin chapter boundary
      if (isLocalScope(role) && semester.chapterId !== session.user?.chapterId) {
        return NextResponse.json({ error: 'Forbidden: Cannot modify another chapter\'s semester' }, { status: 403 });
      }

      // If activating, close others in the same chapter first
      if (semester.status !== 'ACTIVE') {
        await db.semester.updateMany({
          where: { chapterId: semester.chapterId, status: 'ACTIVE' },
          data: { status: 'CLOSED' }
        });
      }

      const updated = await db.semester.update({
        where: { id: semesterId },
        data: { status: semester.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' }
      });

      return NextResponse.json(updated);
    }

    if (action === 'CREATE_YEAR') {
      // ONLY local admins can create years for their own chapter
      if (!isLocalScope(role)) {
        return NextResponse.json({ error: 'Forbidden: Only local administrators can initialize academic years' }, { status: 403 });
      }

      const targetChapterId = session.user?.chapterId;

      if (!targetChapterId) {
        return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
      }

      const year = await db.academicYear.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          chapterId: targetChapterId,
        }
      });
      return NextResponse.json(year);
    }

    if (action === 'UPDATE_YEAR') {
      const year = await db.academicYear.findUnique({ where: { id: yearId } });
      if (!year) return NextResponse.json({ error: 'Year not found' }, { status: 404 });

      if (isLocalScope(role) && year.chapterId !== session.user?.chapterId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await db.academicYear.update({
        where: { id: yearId },
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }
      });
      return NextResponse.json(updated);
    }

    if (action === 'CREATE_SEMESTER') {
      const year = await db.academicYear.findUnique({ where: { id: yearId } });
      if (!year) return NextResponse.json({ error: 'Year not found' }, { status: 404 });

      if (isLocalScope(role) && year.chapterId !== session.user?.chapterId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const semester = await db.semester.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          academicYearId: yearId,
          chapterId: year.chapterId,
        }
      });
      return NextResponse.json(semester);
    }

    if (action === 'UPDATE_SEMESTER') {
      const semester = await db.semester.findUnique({ where: { id: semesterId } });
      if (!semester) return NextResponse.json({ error: 'Semester not found' }, { status: 404 });

      if (isLocalScope(role) && semester.chapterId !== session.user?.chapterId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await db.semester.update({
        where: { id: semesterId },
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }
      });
      return NextResponse.json(updated);
    }

    if (action === 'DELETE_SEMESTER') {
      const semester = await db.semester.findUnique({ where: { id: semesterId } });
      if (!semester) return NextResponse.json({ error: 'Semester not found' }, { status: 404 });

      if (isLocalScope(role) && semester.chapterId !== session.user?.chapterId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await db.semester.delete({ where: { id: semesterId } });
      return NextResponse.json({ message: 'Semester deleted' });
    }

    if (action === 'DELETE_YEAR') {
      const { yearId } = body;
      const year = await db.academicYear.findUnique({ where: { id: yearId } });
      if (!year) return NextResponse.json({ error: 'Year not found' }, { status: 404 });

      if (isLocalScope(role) && year.chapterId !== session.user?.chapterId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await db.academicYear.delete({ where: { id: yearId } });
      return NextResponse.json({ message: 'Academic year and associated semesters deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Calendar update error:', err);
    const error = err as { code?: string; message?: string };
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'An academic year with this name already exists for this chapter.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update calendar' }, { status: 500 });
  }
}
