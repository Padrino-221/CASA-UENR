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
          role === 'LOCAL_ADMIN' ? { chapterId: contextId || 'none' } : {},
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
          role === 'LOCAL_ADMIN' ? { id: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { regionId: contextId || 'none' } : {},
        ]
      },
      select: {
        name: true,
        _count: { 
          select: { 
            students: startDate || endDate ? { 
              where: {
                ...(startDate ? { enrollmentDate: { gte: startDate } } : {}),
                ...(endDate ? { enrollmentDate: { lte: endDate } } : {})
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
          role === 'LOCAL_ADMIN' ? { chapterId: contextId || 'none' } : {},
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
          role === 'LOCAL_ADMIN' ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
          ...df
        ]
      },
      orderBy: { date: 'asc' }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((m: string, index: number) => {
      const income = transactions
        .filter((c: { type: string; date: Date; amount?: number }) => c.type === 'INCOME' && new Date(c.date).getMonth() === index)
        .reduce((sum: number, c: { type: string; date: Date; amount?: number }) => sum + (c.amount || 0), 0);
      
      const expense = transactions
        .filter((c: { type: string; date: Date; amount?: number }) => c.type === 'EXPENSE' && new Date(c.date).getMonth() === index)
        .reduce((sum: number, c: { type: string; date: Date; amount?: number }) => sum + (c.amount || 0), 0);

      return { month: m, amount: income, expense, balance: income - expense };
    });

    return NextResponse.json({
      categoryStats: categoryStats.map((s: { category: string; _sum: { amount: number | null }; type: string }) => ({ 
        name: s.category, 
        value: s._sum.amount || 0,
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
