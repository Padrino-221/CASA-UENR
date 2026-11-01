import RecentCollections from '@/components/dashboard/RecentCollections';
import StatCard from '@/components/dashboard/StatCard';
import React from 'react';
import {
  UsersThree,
  Wallet,
  TrendUp,
  CalendarBlank,
  DownloadSimple,
  Building
} from '@phosphor-icons/react/dist/ssr';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import LocalAnalytics from '@/components/dashboard/LocalAnalytics';
import Link from 'next/link';

export default async function LocalDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;
  if (role === 'NATIONAL_ADMIN') {
    redirect('/');
  }
  if (role === 'REGIONAL_ADMIN') {
    redirect('/regional');
  }

  const chapterId = session.user?.chapterId || 'none';

  // Fetch data directly on the server
  const [membersCount, totalFinancials, currentInstitution, leadersCount, currentYear, activeSemester] = await Promise.all([
    db.student.count({ where: { chapterId } }),
    db.transaction.aggregate({
      where: { chapterId, type: 'INCOME' },
      _sum: { amount: true }
    }),
    db.chapter.findUnique({
      where: { id: chapterId },
      include: { region: true }
    }),
    db.student.count({ where: { chapterId, isLeader: true } }),
    db.academicYear.findFirst({
      where: { chapterId, isCurrent: true }
    }),
    db.semester.findFirst({
      where: { chapterId, status: 'ACTIVE' }
    }),

  ]);

  const stats = [
    {
      label: 'Members',
      value: membersCount.toLocaleString(),
      icon: UsersThree,
      change: 'Registered members',
      color: 'text-white',
      bg: 'bg-[#10B981]',
      ringColor: 'ring-[#10B981]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Total Finance',
      value: `GH₵ ${Number(totalFinancials._sum.amount || 0).toLocaleString()}`,
      icon: Wallet,
      change: 'All recorded income',
      color: 'text-white',
      bg: 'bg-[#FF6B4A]',
      ringColor: 'ring-[#FF6B4A]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Student Leaders',
      value: leadersCount.toString(),
      icon: TrendUp,
      change: 'Active',
      color: 'text-white',
      bg: 'bg-[#3B82F6]',
      ringColor: 'ring-[#3B82F6]/15',
      pillBg: 'bg-blue-50/70 text-blue-600 border-blue-200/50'
    },
    {
      label: 'Current Cycle',
      value: activeSemester?.name || 'Not set',
      icon: CalendarBlank,
      change: currentYear?.name || 'N/A',
      color: 'text-white',
      bg: 'bg-[#3B82F6]',
      ringColor: 'ring-[#3B82F6]/15',
      pillBg: 'bg-indigo-50/70 text-indigo-600 border-indigo-200/50'
    }
  ];

  const recentCollections = await db.transaction.findMany({
    where: { chapterId, type: 'INCOME' },
    take: 5,
    orderBy: { date: 'desc' },
    include: { student: true }
  });

  const chartStartDate = new Date();
  chartStartDate.setDate(chartStartDate.getDate() - 180);

  const recentTransactionsForChart = await db.transaction.findMany({
    where: {
      chapterId,
      type: 'INCOME',
      date: { gte: chartStartDate }
    },
    orderBy: { date: 'asc' },
    select: { date: true, amount: true }
  });

  let chartData: { name: string; value: number }[] = Object.values(recentTransactionsForChart.reduce((acc: Record<string, { name: string; value: number }>, t) => {
    const day = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!acc[day]) acc[day] = { name: day, value: 0 };
    acc[day].value += Number(t.amount);
    return acc;
  }, {})).slice(-6);

  if (chartData.length === 0) {
    const fallbackTransactions = await db.transaction.findMany({
      where: { chapterId, type: 'INCOME' },
      orderBy: { date: 'asc' },
      take: 6,
      select: { date: true, amount: true }
    });

    chartData = fallbackTransactions.map((t) => ({
      name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: Number(t.amount)
    }));
  }

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto stagger-fade-in">

      {/* Premium Header - Exact National Style */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#1D4ED8] font-semibold text-[14px] normal-case tracking-normal">
              <Building size={14} weight="bold" />
              <span>Chapter Hub • {currentInstitution?.region?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F172A] tracking-tight leading-none">{currentInstitution?.name}</h1>
            <p className="text-sm normal-case font-semibold text-slate-500 tracking-normal mt-2.5">Manage your chapter</p>
          </div>
          <div className="actions-cluster">
            <Link
              href="/reports"
              className="btn-glass-alt"
            >
              <DownloadSimple size={18} weight="bold" />
              <span>Export Records</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Redesigned Metrics Grid - Exact Match of National Admin Cards Layout */}
      <div className="admin-stats-grid admin-stats-four">
        {stats.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} detail={stat.change} />)}
      </div>

      {/* Main Content Grid - gap-6 items-start */}
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Analytics Card - Aligned to National Design Style */}
        <div className="lg:col-span-8 card-premium p-6 flex flex-col justify-between hover:border-[#1D4ED8]/20 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm font-semibold text-slate-500 block">Finance Analytics</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-semibold text-slate-900 tracking-tight">GH₵ {Number(totalFinancials._sum.amount || 0).toLocaleString()}</span>
                <span className="text-sm font-bold text-slate-400 normal-case tracking-normal">Received Finance</span>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-2">
            <LocalAnalytics chartData={chartData} />
          </div>
        </div>

        <RecentCollections
          className="lg:col-span-4"
          entries={recentCollections.map((collection) => ({
            id: collection.id,
            name: collection.student?.name ?? 'Church collection',
            category: collection.category.replace(/_/g, ' ').toLowerCase(),
            date: collection.date,
            amount: Number(collection.amount),
          }))}
        />


      </div>
    </div>
  );
}
