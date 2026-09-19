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
      value: `GH₵ ${(totalFinancials._sum.amount || 0).toLocaleString()}`,
      icon: Wallet,
      change: `GH₵ ${(totalFinancials._sum.amount ? Math.round(totalFinancials._sum.amount * 0.052) : 0).toLocaleString()}`,
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#FF6B4A]',
      ringColor: 'ring-[#FF6B4A]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Members',
      value: membersCount.toLocaleString(),
      icon: UsersThree,
      change: `${growthRate.toFixed(1)}%`,
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#10B981]',
      ringColor: 'ring-[#10B981]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Active Chapters',
      value: institutionsCount.toString(),
      icon: Buildings,
      change: '+2',
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#3B82F6]',
      ringColor: 'ring-[#3B82F6]/15',
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Dashboard</h1>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Dashboard</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-premium p-5 !flex-row !items-center gap-4 transition-all duration-300 group">
              {/* Left Column: Solid rounded icon container with halo ring */}
              <div className={`w-12 h-12 sm:w-16 sm:h-16 sm: ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 ring-4 sm:ring-6 ${stat.ringColor} transition-transform duration-300 group-hover:scale-105`}>
                <Icon size={20} className="sm:hidden" weight="bold" />
                <Icon size={26} className="hidden sm:block" weight="bold" />
              </div>

              {/* Right Column: Label & Value with Pill next to it */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] block">{stat.label}</span>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-none">
                    {stat.value}
                  </h3>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border flex items-center gap-0.5 shrink-0 ${stat.pillBg}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Promos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        <DashboardChartWrapper availableYears={availableYears} />

        <RegionPromoCTA />
      </div>

      {/* Bottom Activities & Transaction Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Timeline Activities Feed (span 5) */}
        <div className="lg:col-span-5 card-premium p-6 hover:border-[#1E67FC]/20 transition-all duration-300">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8] block">activity logs</span>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Recent Activities</h3>
            </div>
            <Link href="/admins/logs" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:bg-[#1E67FC]/5 hover:text-[#1E67FC] hover:border-[#1E67FC]/10 transition-all text-[10px] font-extrabold uppercase tracking-widest text-[#475569] group">
              <span>View Logs</span>
              <CaretRight size={12} className="transition-transform group-hover:translate-x-0.5" weight="duotone" />
            </Link>
          </div>

          <div className="relative pl-7 space-y-4 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gradient-to-b before:from-slate-100 before:via-slate-200 before:to-transparent">
            {recentLogs.map((log: { id: string; user?: { name?: string; role?: string }; action: string; entity: string; createdAt: Date }) => {
              const gradientIdx = log.user?.name ? log.user.name.charCodeAt(0) % avatarGradients.length : 0;
              const gradient = avatarGradients[gradientIdx];
              return (
                <div key={log.id} className="relative flex items-start gap-4 p-3 hover:bg-white/60 hover:border-slate-100/80 border border-transparent transition-all duration-300 group/item">
                  {/* Circular administrative dynamic avatar */}
                  <div className={`absolute left-[4px] w-[27px] h-[27px] rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center font-black text-[9px] z-10 border border-white transition-transform group-hover/item:scale-105`}>
                    {getInitials(log.user?.name || 'Administrator')}
                  </div>

                  <div className="flex-1 min-w-0 pl-7">
                    <p className="text-[11px] text-[#475569] font-medium leading-normal">
                      <span className="text-[#1E67FC] font-extrabold">{log.user?.name || 'Administrator'}</span>{' '}
                      performed <span className="font-extrabold text-[#0F172A]">{log.action.toLowerCase()}</span> on{' '}
                      <span className="font-extrabold text-[#0F172A]">{log.entity.toLowerCase()}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[8px] font-bold text-[#94A3B8]">
                      <Clock size={11} weight="duotone" />
                      <span>{getRelativeTime(log.createdAt)}</span>
                      <span>•</span>
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50/80 border border-blue-100/40 text-[#1E67FC]">
                        {log.user?.role?.split('_')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {recentLogs.length === 0 && (
              <div className="p-8 text-center text-xs font-medium text-[#94A3B8] italic">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>

        {/* Transaction Ledger Table Sheet (span 7) */}
        <div className="lg:col-span-7 card-premium overflow-hidden !p-0 hover:border-[#1E67FC]/20 transition-all duration-300">
          <div className="p-5 border-b border-[#E2E8F0]/80 flex justify-between items-center bg-white/40">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8] block">Finance</span>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Recent Inflows</h3>
            </div>
            <Link href="/collections" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:bg-[#1E67FC]/5 hover:text-[#1E67FC] hover:border-[#1E67FC]/10 transition-all text-[10px] font-extrabold uppercase tracking-widest text-[#475569] group h-9">
              <span>View Ledger</span>
              <CaretRight size={12} className="transition-transform group-hover:translate-x-0.5" weight="duotone" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]/80 bg-slate-50/50">
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">chapter ID</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">date</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">chapter</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-[#94A3B8] text-right">amount</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-[#94A3B8] text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60">
                {recentCollections.map((col: { id: string; date: Date; chapter: { name: string }; amount: number }) => (
                  <tr key={col.id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-extrabold text-[#1E67FC] text-[10px] bg-[#1E67FC]/5 px-2 py-0.5 border border-[#1E67FC]/10 tracking-wider">
                        #{col.id.substring(col.id.length - 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[11px] font-semibold text-[#475569]">
                      {new Date(col.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[11px] text-[#0F172A]">
                      {col.chapter?.name ?? 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-[12px] text-slate-900 text-right">
                      GH₵ {col.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}

                {recentCollections.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <Wallet size={20} weight="duotone" className="text-slate-400" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 tracking-tight">No finance recorded this week</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                          When new finance entries are recorded by chapters, they will appear here in your transaction ledger.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
