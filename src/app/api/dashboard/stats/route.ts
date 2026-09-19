import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const role = session.user?.role;
    if (!role) {
      return NextResponse.json({ error: 'Forbidden: Role could not be determined.' }, { status: 403 });
    }
    const contextId = role === 'REGIONAL_ADMIN' ? session.user?.regionId : session.user?.chapterId;

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const targetYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    let stats: { label: string; value: string; icon: string; change: string; positive: boolean; color: string; path: string }[] = [];
    let recentCollections: { id: string; date: Date; amount: number; description?: string; chapter: { name: string } }[] = [];
    let chartData: { name: string; value: number }[] = [];

    if (role === 'NATIONAL_ADMIN') {
      const [membersCount, chaptersCount, totalFinancials] = await Promise.all([
        db.student.count(),
        db.chapter.count(),
        db.transaction.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } })
      ]);

      stats = [
        { label: 'Global Members', value: membersCount.toLocaleString(), icon: 'users', change: '+12%', positive: true, color: 'cyan', path: '/students' },
        { label: 'Global Collections', value: `GHS ${(totalFinancials._sum.amount || 0).toLocaleString()}`, icon: 'wallet', change: '+8.5%', positive: true, color: 'cyan', path: '/collections' },
        { label: 'Total Chapters', value: chaptersCount.toString(), icon: 'church', change: '+2', positive: true, color: 'cyan', path: '/chapters' },
        { label: 'Nat. Growth Rate', value: '18.2%', icon: 'trending-up', change: '-1.4%', positive: false, color: 'cyan', path: '/reports' },
      ];

      recentCollections = await db.transaction.findMany({
        where: { type: 'INCOME' },
        take: 5,
        orderBy: { date: 'desc' },
        include: { chapter: true }
      });

      const regions = await db.region.findMany({
        include: { _count: { select: { chapters: true } } }
      });
      chartData = regions.map((r: { name: string; _count: { chapters: number } }) => ({ name: r.name, value: r._count.chapters }));

      // Compute monthly chapter registrations for the selected year
      const allChapters = await db.chapter.findMany({
        select: { createdAt: true }
      });
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyRegMap: { [key: string]: number } = {};
      monthNames.forEach(m => { monthlyRegMap[m] = 0; });
      allChapters.forEach((ch: { createdAt: Date }) => {
        const d = new Date(ch.createdAt);
        if (d.getFullYear() === targetYear) {
          monthlyRegMap[monthNames[d.getMonth()]]++;
        }
      });
      const monthlyRegistrations = monthNames.map(name => ({
        name,
        value: monthlyRegMap[name]
      }));

      return NextResponse.json({ stats, recentCollections, chartData, monthlyRegistrations });

    } else if (role === 'REGIONAL_ADMIN') {
      const regionId = contextId || 'none';
      const [membersCount, chaptersCount, totalFinancials] = await Promise.all([
        db.student.count({ where: { chapter: { regionId } } }),
        db.chapter.count({ where: { regionId } }),
        db.transaction.aggregate({ 
          where: { chapter: { regionId }, type: 'INCOME' },
          _sum: { amount: true } 
        })
      ]);

      stats = [
        { label: 'Regional Members', value: membersCount.toLocaleString(), icon: 'users', change: '+5%', positive: true, color: 'cyan', path: '/students' },
        { label: 'Regional Collections', value: `GHS ${(totalFinancials._sum.amount || 0).toLocaleString()}`, icon: 'wallet', change: '+3.2%', positive: true, color: 'cyan', path: '/collections' },
        { label: 'Campus Chapters', value: chaptersCount.toString(), icon: 'church', change: '0', positive: true, color: 'cyan', path: '/chapters' },
        { label: 'Performance', value: '92%', icon: 'trending-up', change: '+2%', positive: true, color: 'cyan', path: '/reports' },
      ];

      recentCollections = await db.transaction.findMany({
        where: { chapter: { regionId }, type: 'INCOME' },
        take: 5,
        orderBy: { date: 'desc' },
        include: { chapter: true }
      });

      const chapters = await db.chapter.findMany({
        where: { regionId },
        include: { _count: { select: { students: true } } }
      });
      chartData = chapters.map((ch: { name: string; _count: { students: number } }) => ({ name: ch.name, value: ch._count.students }));

      // Monthly registrations for region chapters
      const regionChapters = await db.chapter.findMany({
        where: { regionId },
        select: { createdAt: true }
      });
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyRegMap: { [key: string]: number } = {};
      monthNames.forEach(m => { monthlyRegMap[m] = 0; });
      regionChapters.forEach((ch: { createdAt: Date }) => {
        const d = new Date(ch.createdAt);
        if (d.getFullYear() === targetYear) {
          monthlyRegMap[monthNames[d.getMonth()]]++;
        }
      });
      const monthlyRegistrations = monthNames.map(name => ({
        name,
        value: monthlyRegMap[name]
      }));

      return NextResponse.json({ stats, recentCollections, chartData, monthlyRegistrations });

    } else if (isLocalScope(role)) {
      const chapterId = contextId || 'none';
      const [membersCount, totalFinancials] = await Promise.all([
        db.student.count({ where: { chapterId } }),
        db.transaction.aggregate({ 
          where: { chapterId, type: 'INCOME' },
          _sum: { amount: true } 
        })
      ]);

      stats = [
        { label: 'Campus Members', value: membersCount.toLocaleString(), icon: 'users', change: '+8', positive: true, color: 'cyan', path: '/students' },
        { label: 'Total Finance', value: `GHS ${(totalFinancials._sum.amount || 0).toLocaleString()}`, icon: 'wallet', change: '+15%', positive: true, color: 'cyan', path: '/collections' },
        { label: 'Active Leaders', value: '12', icon: 'trending-up', change: '+1', positive: true, color: 'cyan', path: '/reports' },
        { label: 'Spiritual Growth', value: 'High', icon: 'trending-up', change: 'Stable', positive: true, color: 'cyan', path: '/calendar' },
      ];

      recentCollections = await db.transaction.findMany({
        where: { chapterId, type: 'INCOME' },
        take: 5,
        orderBy: { date: 'desc' },
        include: { chapter: true }
      });

      const last4Weeks = [
        { name: 'Week 1', value: 1200 },
        { name: 'Week 2', value: 1800 },
        { name: 'Week 3', value: 1400 },
        { name: 'Week 4', value: 2500 },
      ];
      chartData = last4Weeks;

      return NextResponse.json({ stats, recentCollections, chartData });
    }

    return NextResponse.json({ stats, recentCollections, chartData });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
