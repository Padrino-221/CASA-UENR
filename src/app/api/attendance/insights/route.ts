import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope } from '@/lib/roles';

const CHALLENGE_OPTIONS = [
  'Low Attendance',
  'Venue Issues',
  'Technical Issues',
  'Financial Constraints',
  'Time Management',
  'Member Indiscipline',
  'Logistics',
  'Administrative Issues'
];

const EXEC_ATTITUDES = ['Excellent', 'Good', 'Fair', 'Indifferent'];

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const serviceType = searchParams.get('serviceType');
  const chapterId = searchParams.get('chapterId');

  const role = session.user?.role;
  if (!role) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const filters: Record<string, unknown>[] = [];

    if (isLocalScope(role)) {
      filters.push({ chapterId: session.user?.chapterId || 'none' });
    } else if (role === 'REGIONAL_ADMIN') {
      filters.push({ chapter: { regionId: session.user?.regionId || 'none' } });
    } else if (chapterId) {
      filters.push({ chapterId });
    }

    if (dateFrom) {
      filters.push({ date: { gte: new Date(dateFrom) } });
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filters.push({ date: { lte: endDate } });
    }
    if (serviceType) {
      filters.push({ serviceType });
    }

    const sessions = await db.attendanceSession.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      include: {
        chapter: { select: { name: true } },
        _count: { select: { records: true } }
      },
      orderBy: { date: 'asc' }
    });

    type SessionWithChapter = typeof sessions[number];
    const totalSessions = sessions.length;
    const sessionsWithAttendance = sessions.filter((s: SessionWithChapter) => s.totalAttendance !== null);
    const totalAttendance = sessionsWithAttendance.reduce((sum: number, s: SessionWithChapter) => sum + (s.totalAttendance ?? 0), 0);
    const avgAttendance = sessionsWithAttendance.length > 0
      ? Math.round(totalAttendance / sessionsWithAttendance.length)
      : 0;

    const periodStart = sessions.length > 0 ? sessions[0].date.toISOString() : null;
    const periodEnd = sessions.length > 0 ? sessions[sessions.length - 1].date.toISOString() : null;

    const challengeCounts = new Map<string, number>();
    for (const opt of CHALLENGE_OPTIONS) {
      challengeCounts.set(opt, 0);
    }
    let otherChallengeCount = 0;
    for (const s of sessions) {
      if (s.challenges && s.challenges !== 'None') {
        if (CHALLENGE_OPTIONS.includes(s.challenges)) {
          challengeCounts.set(s.challenges, (challengeCounts.get(s.challenges) ?? 0) + 1);
        } else {
          otherChallengeCount++;
        }
      }
    }
    const challengeFrequency = [...challengeCounts.entries()]
      .map(([challenge, count]) => ({
        challenge,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    if (otherChallengeCount > 0) {
      challengeFrequency.push({
        challenge: 'Other',
        count: otherChallengeCount,
        percentage: totalSessions > 0 ? Math.round((otherChallengeCount / totalSessions) * 100) : 0
      });
    }

    const monthMap = new Map<string, { totalAtt: number; count: number }>();
    for (const s of sessions) {
      const key = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key) ?? { totalAtt: 0, count: 0 };
      if (s.totalAttendance !== null) {
        entry.totalAtt += s.totalAttendance;
      }
      entry.count += 1;
      monthMap.set(key, entry);
    }
    const attendanceTrends = [...monthMap.entries()]
      .map(([month, data]) => ({
        month,
        avgAttendance: data.count > 0 ? Math.round(data.totalAtt / data.count) : 0,
        totalSessions: data.count
      }));

    const execCounts = new Map<string, number>();
    for (const attitude of EXEC_ATTITUDES) {
      execCounts.set(attitude, 0);
    }
    for (const s of sessions) {
      const attitude = s.attitudeOfExecutives || 'Excellent';
      if (execCounts.has(attitude)) {
        execCounts.set(attitude, (execCounts.get(attitude) ?? 0) + 1);
      }
    }
    const executiveHealth = EXEC_ATTITUDES.map(attitude => ({
      attitude,
      count: execCounts.get(attitude) ?? 0,
      percentage: totalSessions > 0 ? Math.round(((execCounts.get(attitude) ?? 0) / totalSessions) * 100) : 0
    }));

    const svcTypeMap = new Map<string, { totalAtt: number; count: number }>();
    for (const s of sessions) {
      const entry = svcTypeMap.get(s.serviceType) ?? { totalAtt: 0, count: 0 };
      if (s.totalAttendance !== null) {
        entry.totalAtt += s.totalAttendance;
      }
      entry.count += 1;
      svcTypeMap.set(s.serviceType, entry);
    }
    const serviceTypeBreakdown = [...svcTypeMap.entries()]
      .map(([serviceType, data]) => ({
        serviceType,
        avgAttendance: data.count > 0 ? Math.round(data.totalAtt / data.count) : 0,
        totalSessions: data.count
      }))
      .sort((a, b) => b.totalSessions - a.totalSessions);

    const chapterMap = new Map<string, { totalAtt: number; count: number; name: string }>();
    for (const s of sessions) {
      const chId = s.chapterId ?? 'unknown';
      const entry = chapterMap.get(chId) ?? { totalAtt: 0, count: 0, name: s.chapter?.name ?? 'Unknown' };
      if (s.totalAttendance !== null) {
        entry.totalAtt += s.totalAttendance;
      }
      entry.count += 1;
      chapterMap.set(chId, entry);
    }
    const chapterComparison = [...chapterMap.entries()]
      .map(([, data]) => ({
        chapterName: data.name,
        avgAttendance: data.count > 0 ? Math.round(data.totalAtt / data.count) : 0,
        totalSessions: data.count
      }))
      .sort((a, b) => b.avgAttendance - a.avgAttendance);

    return NextResponse.json({
      summary: { totalSessions, avgAttendance, totalAttendance, periodStart, periodEnd },
      challengeFrequency,
      attendanceTrends,
      executiveHealth,
      serviceTypeBreakdown,
      chapterComparison
    });
  } catch (err) {
    console.error('Attendance insights error:', err);
    return NextResponse.json({ error: 'Failed to compute insights' }, { status: 500 });
  }
}
