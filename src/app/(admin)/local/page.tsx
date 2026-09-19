import React from 'react';
import {
  UsersThree,
  Wallet,
  TrendUp,
  CalendarBlank,
  DownloadSimple,
  Building,
  CaretRight
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
  const [
    membersCount,
    totalFinancials,
    currentInstitution,
    leadersCount,
    currentYear,
    activeSemester,
    upcomingEvents
  ] = await Promise.all([
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
    db.event.findMany({
      where: {
        OR: [
          { chapterId },
          { scope: 'NATIONAL' },
          { AND: [{ scope: 'REGIONAL' }, { region: { chapters: { some: { id: chapterId } } } }] }
        ],
        date: { gte: new Date() }
      },
      take: 2,
      orderBy: { date: 'asc' }
    })
  ]);

  const stats = [
    {
      label: 'Members',
      value: membersCount.toLocaleString(),
      icon: UsersThree,
      change: '+0',
      color: 'text-white',
      bg: 'bg-[#10B981]',
      ringColor: 'ring-[#10B981]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Total Finance',
      value: `GH₵ ${(totalFinancials._sum.amount || 0).toLocaleString()}`,
      icon: Wallet,
      change: 'Lifetime',
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
      value: activeSemester?.name || 'No Active Sem',
      icon: CalendarBlank,
      change: currentYear?.name || 'N/A',
      color: 'text-white',
      bg: 'bg-[#3B82F6]',
      ringColor: 'ring-[#3B82F6]/15',
      pillBg: 'bg-indigo-50/70 text-indigo-600 border-indigo-200/50'
    },
  ];

  const recentCollections = await db.transaction.findMany({
    where: { chapterId, type: 'INCOME' },
    take: 5,
    orderBy: { date: 'desc' },
    include: { student: true }
  });

  const recentTransactionsForChart = await db.transaction.findMany({
    where: {
      chapterId,
      type: 'INCOME',
      date: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } // eslint-disable-line react-hooks/purity
    },
    orderBy: { date: 'asc' },
    select: { date: true, amount: true }
  });

  let chartData: { name: string; value: number }[] = Object.values((recentTransactionsForChart as { date: Date; amount: number }[]).reduce((acc: Record<string, { name: string; value: number }>, t: { date: Date; amount: number }) => {
    const day = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!acc[day]) acc[day] = { name: day, value: 0 };
    acc[day].value += t.amount;
    return acc;
  }, {})).slice(-6);

  if (chartData.length === 0) {
    const fallbackTransactions = await db.transaction.findMany({
      where: { chapterId, type: 'INCOME' },
      orderBy: { date: 'asc' },
      take: 6,
      select: { date: true, amount: true }
    });

    chartData = fallbackTransactions.map((t: { date: Date; amount: number }) => ({
      name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: t.amount
    }));
  }

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto stagger-fade-in">

      {/* Premium Header - Exact National Style */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#1E67FC] font-black text-[10px] uppercase tracking-widest">
              <Building size={14} weight="bold" />
              <span>Chapter Hub • {currentInstitution?.region?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">{currentInstitution?.name}</h1>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Manage your chapter</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-[#0F172A] tracking-tight leading-none">
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

      {/* Main Content Grid - gap-6 items-start */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Analytics Card - Aligned to National Design Style */}
        <div className="lg:col-span-8 card-premium p-6 flex flex-col justify-between hover:border-[#1E67FC]/20 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Finance Analytics</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">GH₵ {(totalFinancials._sum.amount || 0).toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Received Finance</span>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-2">
            <LocalAnalytics chartData={chartData} />
          </div>
        </div>

        {/* Dynamic Activity/Calendar Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          <div className="card-premium overflow-hidden !p-0 hover:border-[#1E67FC]/20 transition-all duration-300 flex-grow">
            <div className="p-5 border-b border-[#E2E8F0]/80 flex justify-between items-center bg-white/40">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8] block">Finance</span>
                <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Recent Collections</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recentCollections.map((col: { id: string; student: { name: string } | null; category: string; amount: number; date: Date }) => (
                <div key={col.id} className="p-4 hover:bg-slate-50/50 transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-black/5 flex items-center justify-center font-black text-[#1E67FC] text-[10px] group-hover:scale-105 transition-transform duration-300">
                      {col.student ? col.student.name.substring(0, 2).toUpperCase() : 'IN'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[12px] text-[#0F172A] truncate max-w-[140px]">{col.student ? col.student.name : 'Institutional'}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{col.category.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[#1E67FC] text-[12px]">GH₵ {col.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-[9px] font-semibold text-[#475569] mt-0.5">{new Date(col.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              ))}
              {recentCollections.length === 0 && (
                <div className="p-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">No collections registered yet.</div>
              )}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#1358E2] p-6 text-white relative overflow-hidden group flex flex-col justify-between min-h-[220px]">

            {/* Design highlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-[9px] font-black bg-white/12 border border-white/15 backdrop-blur-md px-3 py-1 uppercase tracking-widest !text-white block w-fit">
                upcoming events
              </span>

              <div className="space-y-3 mt-4 relative z-10">
                {upcomingEvents.map((event: { id: string; title: string; date: Date; venue?: string }) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
                    <div className="bg-[#1E67FC] w-8 h-8 flex items-center justify-center shrink-0">
                      <CalendarBlank size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs tracking-wide">{event.title}</div>
                      <div className="text-[9px] font-bold text-blue-300 mt-0.5 uppercase tracking-widest">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {event.venue || 'TBD'}
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="flex items-center justify-center p-6 bg-white/5 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    No sessions scheduled.
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/calendar"
              className="w-full mt-4 py-3.5 bg-white/10 hover:bg-white/15 text-white font-black text-[9px] uppercase tracking-widest transition-all backdrop-blur-sm relative z-10 border border-white/10 flex items-center justify-center gap-1.5 group"
            >
              <span>Full Ministry Calendar</span>
              <CaretRight size={12} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
