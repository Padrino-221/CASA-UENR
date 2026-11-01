import { Prisma } from '@prisma/client';
import { canViewAdministrativeData, isLocalScope as hasChapterScope } from '@/lib/roles';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

function dateFilter(startDate?: Date, endDate?: Date) {
  const conditions: Record<string, unknown>[] = [];
  if (startDate) conditions.push({ date: { gte: startDate } });
  if (endDate) conditions.push({ date: { lte: endDate } });
  return conditions;
}

export async function GET(request: Request) {
  const session = await auth();
    if (session && !canViewAdministrativeData(session.user?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const role = session.user?.role;
    if (!role) {
      return NextResponse.json({ error: 'Forbidden: Role could not be determined.' }, { status: 403 });
    }
    const contextId = role === 'REGIONAL_ADMIN' ? session.user?.regionId : session.user?.chapterId;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '12m';
    const yearParam = searchParams.get('year');
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (yearParam) {
      const y = parseInt(yearParam);
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 11, 31, 23, 59, 59);
    } else if (range === '6m') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (range === '12m') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const df = dateFilter(startDate, endDate);

    // Financial Analysis (Inflow vs Outflow)
    const categoryStats = await db.transaction.groupBy({
      by: ['category', 'type'],
      where: {
        AND: [
          hasChapterScope(role) ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ...df
        ]
      },
      _sum: { amount: true },
    });

    // Student Demographics
    const chapterStats = await db.chapter.findMany({
      where: {
        AND: [
          hasChapterScope(role) ? { id: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { regionId: contextId || 'none' } : {},
        ]
      },
      select: {
        name: true,
        _count: {
          select: {
            students: startDate || endDate ? {
              where: {
                enrollmentDate: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) }
              }
            } : true
          }
        }
      }
    });

    // Attendance Performance (Average presence per session)
    const attendanceSessions = await db.attendanceSession.findMany({
      where: {
        AND: [
          hasChapterScope(role) ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ...df
        ]
      },
      include: {
        _count: { select: { records: true } }
      }
    });

    // Time-series data
    const transactions = await db.transaction.findMany({
      where: {
        AND: [
          hasChapterScope(role) ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ...df
        ]
      },
      orderBy: { date: 'asc' }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((m: string, index: number) => {
      const income = transactions
        .filter((c) => c.type === 'INCOME' && new Date(c.date).getMonth() === index)
        .reduce((sum, c) => sum.plus(c.amount), new Prisma.Decimal(0)).toNumber();

      const expense = transactions
        .filter((c) => c.type === 'EXPENSE' && new Date(c.date).getMonth() === index)
        .reduce((sum, c) => sum.plus(c.amount), new Prisma.Decimal(0)).toNumber();

      return { month: m, amount: income, expense, balance: income - expense };
    });

    return NextResponse.json({
      categoryStats: categoryStats.map((s) => ({
        name: s.category,
        value: Number(s._sum.amount || 0),
        type: s.type
      })),
      institutionStats: chapterStats.map((ch: { name: string; _count: { students: number } }) => ({
        name: ch.name,
        value: ch._count.students || 0
      })),
      monthlyData,
      attendanceStats: {
        totalSessions: attendanceSessions.length,
        avgAttendance: attendanceSessions.length > 0
          ? attendanceSessions.reduce((acc: number, s: { _count: { records: number } }) => acc + s._count.records, 0) / attendanceSessions.length
          : 0
      }
    });

  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
