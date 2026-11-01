import RecentCollections from '@/components/dashboard/RecentCollections';
import StatCard from '@/components/dashboard/StatCard';
import React from 'react';
import {
  UsersThree, Wallet, Buildings, DownloadSimple, Clock, CaretRight
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import DashboardChartWrapper from '@/components/dashboard/DashboardChartWrapper';
import RegionPromoCTA from '@/components/dashboard/RegionPromoCTA';

export default async function NationalDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;
  if (role === 'REGIONAL_ADMIN') {
    redirect('/regional');
  }
  if (role === 'LOCAL_ADMIN') {
    redirect('/local');
  }
  if (role === 'CONTENT_MANAGER') {
    redirect('/content');
  }
  if (role === 'FINANCE') {
    redirect('/collections');
  }
  if (role === 'SECRETARY') {
    redirect('/students');
  }

  // Fetch metrics data directly on the server
  const [membersCount, institutionsCount, totalFinancials, recentLogs] = await Promise.all([
    db.student.count(),
    db.chapter.count(),
    db.transaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true }
    }),
    db.auditLog.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    })
  ]);

  // Calculate momentum / change
  const previousMonthCount = await db.student.count({
    where: { enrollmentDate: { lt: new Date(new Date().setMonth(new Date().getMonth() - 1)) } }
  });
  const growthRate = previousMonthCount > 0
    ? ((membersCount - previousMonthCount) / previousMonthCount) * 100
    : 0;

  // 4 metrics cards matching the mockup's visual language
  const stats = [
    {
      label: 'Total Revenue',
      value: `GH₵ ${Number(totalFinancials._sum.amount || 0).toLocaleString()}`,
      icon: Wallet,
      change: 'All recorded income',
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#1D4ED8]',
      ringColor: 'ring-[#1D4ED8]/10',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Members',
      value: membersCount.toLocaleString(),
      icon: UsersThree,
      change: `${growthRate.toFixed(1)}%`,
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#1D4ED8]',
      ringColor: 'ring-[#1D4ED8]/10',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Chapters',
      value: institutionsCount.toString(),
      icon: Buildings,
      change: 'Registered chapters',
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#1D4ED8]',
      ringColor: 'ring-[#1D4ED8]/10',
      pillBg: 'bg-blue-50/70 text-blue-600 border-blue-200/50'
    },
  ];

  const recentCollections = await db.transaction.findMany({
    where: { type: 'INCOME' },
    take: 4,
    orderBy: { date: 'desc' },
    include: { chapter: true }
  });

  // Compute available years for chart filter
  const now = new Date();
  const chapterCreationDates = await db.chapter.findMany({
    select: { createdAt: true }
  });
  const yearsSet = new Set<number>();
  chapterCreationDates.forEach((ch: { createdAt: Date }) => yearsSet.add(ch.createdAt.getFullYear()));
  yearsSet.add(now.getFullYear());
  const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

  // Date helper
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (diffMins < 1) return 'Just Now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Helpers for administrative timeline avatars
  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const avatarGradients = [
    'from-indigo-500 to-sky-400 text-white',
    'from-rose-500 to-amber-400 text-white',
    'from-emerald-500 to-teal-400 text-white',
    'from-violet-500 to-fuchsia-400 text-white'
  ];

  return (
    <div className="space-y-8 w-full">
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F172A] tracking-tight leading-none">Dashboard</h1>
            <p className="text-sm normal-case font-semibold text-slate-500 tracking-normal mt-2.5">An overview of your church network</p>
          </div>
          <div className="actions-cluster">
            <Link href="/api/reports/export" className="btn-glass-alt">
              <DownloadSimple size={18} weight="bold" />
              <span>Export Records</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Redesigned Metrics Grid - Exact Invo Mockup Match */}
      <div className="admin-stats-grid admin-stats-three">
        {stats.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} detail={stat.change} />)}
      </div>

      {/* Main Charts & Promos Grid */}
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        <DashboardChartWrapper availableYears={availableYears} />

        <RegionPromoCTA />
      </div>

      {/* Bottom Activities & Transaction Ledger Grid */}
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Timeline Activities Feed (span 5) */}
        <div className="lg:col-span-5 card-premium p-6 hover:border-[#1D4ED8]/20 transition-all duration-300">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[14px] font-semibold normal-case tracking-normal text-[#64748B] block">activity logs</span>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Recent Activities</h3>
            </div>
            <Link href="/admins/logs" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:bg-[#1D4ED8]/5 hover:text-[#1D4ED8] hover:border-[#1D4ED8]/10 transition-all text-[14px] font-semibold normal-case tracking-normal text-[#475569] group">
              <span>View Logs</span>
              <CaretRight size={12} className="transition-transform group-hover:translate-x-0.5" weight="duotone" />
            </Link>
          </div>

          <div className="relative pl-7 space-y-4 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gradient-to-b before:from-slate-100 before:via-slate-200 before:to-transparent">
            {recentLogs.map((log) => {
              const gradientIdx = log.user?.name ? log.user.name.charCodeAt(0) % avatarGradients.length : 0;
              const gradient = avatarGradients[gradientIdx];
              return (
                <div key={log.id} className="relative flex items-start gap-4 p-3 hover:bg-white/60 hover:border-slate-100/80 border border-transparent transition-all duration-300 group/item">
                  {/* Circular administrative dynamic avatar */}
                  <div className={`absolute left-[4px] w-[27px] h-[27px] rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center font-semibold text-[14px] z-10 border border-white transition-transform group-hover/item:scale-105`}>
                    {getInitials(log.user?.name || 'Administrator')}
                  </div>

                  <div className="flex-1 min-w-0 pl-7">
                    <p className="text-[14px] text-[#475569] font-medium leading-normal">
                      <span className="text-[#1D4ED8] font-semibold">{log.user?.name || 'Administrator'}</span>{' '}
                      performed <span className="font-semibold text-[#0F172A]">{log.action.toLowerCase()}</span> on{' '}
                      <span className="font-semibold text-[#0F172A]">{log.entity.toLowerCase()}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[14px] font-bold text-[#64748B]">
                      <Clock size={11} weight="duotone" />
                      <span>{getRelativeTime(log.createdAt)}</span>
                      <span>•</span>
                      <span className="text-[14px] font-semibold normal-case tracking-normal px-1.5 py-0.5 rounded bg-blue-50/80 border border-blue-100/40 text-[#1D4ED8]">
                        {log.user?.role?.split('_')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {recentLogs.length === 0 && (
              <div className="p-8 text-center text-sm font-medium text-[#64748B] italic">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>

        {/* Transaction Ledger Table Sheet (span 7) */}
        <RecentCollections
          className="lg:col-span-7"
          entries={recentCollections.map((collection) => ({
            id: collection.id,
            name: collection.chapter?.name ?? 'Unassigned chapter',
            date: collection.date,
            amount: Number(collection.amount),
          }))}
        />

      </div>
    </div>
  );
}
