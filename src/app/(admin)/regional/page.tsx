import StatCard from '@/components/dashboard/StatCard';
import React from 'react';
import {
  ArrowRight, CaretRight, DownloadSimple, UsersThree, Wallet, Buildings
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import RegionalAnalytics from '@/components/dashboard/RegionalAnalytics';

export default async function RegionalDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;
  if (role === 'NATIONAL_ADMIN') redirect('/');
  if (role === 'LOCAL_ADMIN') redirect('/local');

  const regionId = session.user?.regionId || 'none';

  // Fetch metrics data directly on the server
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [membersCount, institutionsCount, totalFinancials, regionData, studentsThisMonth, studentsLastMonth, incomeThisMonth, incomeLastMonth] = await Promise.all([
    db.student.count({ where: { chapter: { regionId } } }),
    db.chapter.count({ where: { regionId } }),
    db.transaction.aggregate({
      where: { chapter: { regionId }, type: 'INCOME' },
      _sum: { amount: true }
    }),
    db.region.findUnique({ where: { id: regionId }, select: { name: true } }),
    db.student.count({ where: { chapter: { regionId }, enrollmentDate: { gte: startOfMonth } } }),
    db.student.count({ where: { chapter: { regionId }, enrollmentDate: { gte: startOfLastMonth, lt: startOfMonth } } }),
    db.transaction.aggregate({
      where: { chapter: { regionId }, type: 'INCOME', date: { gte: startOfMonth } },
      _sum: { amount: true }
    }),
    db.transaction.aggregate({
      where: { chapter: { regionId }, type: 'INCOME', date: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { amount: true }
    }),
  ]);

  const currentRegion = regionData?.name || "Region";

  const studentGrowth = studentsLastMonth > 0 ? ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100 : 0;
  const incomeGrowth = incomeLastMonth._sum.amount && Number(incomeLastMonth._sum.amount) > 0
    ? ((Number(incomeThisMonth._sum.amount || 0) - Number(incomeLastMonth._sum.amount)) / Number(incomeLastMonth._sum.amount)) * 100
    : 0;

  // Stats matching the high-fidelity premium design language
  const stats = [
    {
      label: 'Total Income',
      value: `GH₵ ${Number(totalFinancials._sum.amount || 0).toLocaleString()}`,
      icon: Wallet,
      change: `${incomeGrowth >= 0 ? '+' : ''}${incomeGrowth.toFixed(1)}%`,
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#FF6B4A]',
      ringColor: 'ring-[#FF6B4A]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: `${currentRegion} Members`,
      value: membersCount.toLocaleString(),
      icon: UsersThree,
      change: `${studentGrowth >= 0 ? '+' : ''}${studentGrowth.toFixed(1)}%`,
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#10B981]',
      ringColor: 'ring-[#10B981]/15',
      pillBg: 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50'
    },
    {
      label: 'Chapters',
      value: institutionsCount.toString(),
      icon: Buildings,
      change: 'Active',
      changeType: 'up',
      color: 'text-white',
      bg: 'bg-[#3B82F6]',
      ringColor: 'ring-[#3B82F6]/15',
      pillBg: 'bg-blue-50/70 text-blue-600 border-blue-200/50'
    },
  ];

  const recentTransactions = await db.transaction.findMany({
    where: { chapter: { regionId } },
    take: 4,
    orderBy: { date: 'desc' },
    include: { chapter: true, student: true }
  });

  const institutions = await db.chapter.findMany({
    where: { regionId },
    include: { _count: { select: { students: true } } }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = institutions.map((i: any) => ({
    name: i.name,
    value: i._count.students,
    university: i.university,
    campus: i.campus || 'Main'
  }));

  return (
    <div className="space-y-8 w-full stagger-fade-in">

      {/* Regional Header */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <span className="text-[14px] font-semibold normal-case tracking-[0.25em] text-[#1D4ED8] block mb-2">Dashboard</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F172A] tracking-tight leading-none">{currentRegion}</h1>
            <p className="text-sm normal-case font-semibold text-slate-500 tracking-normal mt-2.5">Manage your chapters and view reports</p>
          </div>
          <div className="actions-cluster">
            <Link href="/reports" className="btn-glass-alt">
              <DownloadSimple size={18} weight="bold" />
              <span>Export Records</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Redesigned Metrics Grid */}
      <div className="admin-stats-grid admin-stats-three">
        {stats.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} detail={stat.change} />)}
      </div>

      {/* Main Charts & Promos Grid */}
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Performance (span 8) */}
        <div className="lg:col-span-8 card-premium p-6 flex flex-col justify-between hover:border-[#1D4ED8]/20 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm font-semibold text-slate-500 block">Chapter Performance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-semibold text-slate-900 tracking-tight">{institutionsCount}</span>
                <span className="text-sm font-bold text-slate-400 normal-case tracking-normal">Active Chapter{institutionsCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-2 font-semibold text-slate-800">
            <RegionalAnalytics chartData={chartData} />
          </div>
        </div>

        {/* Sleek Purple-Indigo Promo Callout */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#1D4ED8] to-[#1D4ED8] p-4 sm:p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden group min-h-[260px] sm:min-h-[360px] transition-all duration-500 border border-white/5">

          {/* Triple-layered overlapping filled geometric wave curves */}

          <div className="relative z-10 flex-1">
            <span className="text-[14px] font-semibold bg-white/12 border border-white/15 backdrop-blur-md px-3.5 py-1.5 normal-case tracking-normal !text-white block w-fit">
              Office
            </span>
            <h4 className="text-[22px] font-semibold mt-6 leading-[1.25] !text-white tracking-tight">
              Add New Chapters
            </h4>
            <p className="text-[14px] !text-[#EBF2FF]/90 mt-3 leading-relaxed font-medium">
              Add new chapters and chaplaincy secretariats to scale ministry impact.
            </p>
          </div>

          <Link href="/chapters" className="relative z-10 w-fit bg-white text-[#1D4ED8] font-semibold text-[14px] normal-case tracking-normal py-3.5 px-6 hover:bg-slate-50 transition-all active:scale-[0.98] mt-6 flex items-center gap-2 group/btn">
            <span>Add Chapter</span>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1"><ArrowRight weight="duotone" size={12} /></span>
          </Link>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-12 card-premium overflow-hidden !p-0 hover:border-[#1D4ED8]/20 transition-all duration-300">
          <div className="p-5 border-b border-[#E2E8F0]/80 flex justify-between items-center bg-white/40">
            <div>
              <span className="text-[14px] font-semibold normal-case tracking-normal text-[#64748B] block">Finance</span>
              <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Transactions</h3>
            </div>
            <Link href="/collections" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:bg-[#1D4ED8]/5 hover:text-[#1D4ED8] hover:border-[#1D4ED8]/10 transition-all text-[14px] font-semibold normal-case tracking-normal text-[#475569] group h-9">
              <span>View Ledger</span>
              <CaretRight size={12} className="transition-transform group-hover:translate-x-0.5" weight="duotone" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]/80 bg-slate-50/50">
                  <th className="py-3 px-5 text-[14px] font-semibold normal-case tracking-normal text-[#64748B]">chapter ID</th>
                  <th className="py-3 px-5 text-[14px] font-semibold normal-case tracking-normal text-[#64748B]">date</th>
                  <th className="py-3 px-5 text-[14px] font-semibold normal-case tracking-normal text-[#64748B]">chapter</th>
                  <th className="py-3 px-5 text-[14px] font-semibold normal-case tracking-normal text-[#64748B] text-right">amount</th>
                  <th className="py-3 px-5 text-[14px] font-semibold normal-case tracking-normal text-[#64748B] text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60">
                {// eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentTransactions.map((col: any) => (
                  <tr key={col.id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-[#1D4ED8] text-[14px] bg-[#1D4ED8]/5 px-2 py-0.5 border border-[#1D4ED8]/10 tracking-normal">
                        #{col.id.substring(col.id.length - 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[14px] font-semibold text-[#475569]">
                      {new Date(col.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[14px] text-[#0F172A]">
                      {col.chapter?.name ?? 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[14px] text-slate-900 text-right">
                      GH₵ {Number(col.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}

                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <Wallet size={20} weight="duotone" className="text-slate-400" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight">No finance recorded this week</h4>
                        <p className="text-[14px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                          When finance entries are recorded by chapters in your region, they will appear here.
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
