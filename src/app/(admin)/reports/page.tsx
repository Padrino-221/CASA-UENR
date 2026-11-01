'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import {
  TrendUp,
  Users,
  ChartLineUp
} from '@phosphor-icons/react';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { HeaderSkeleton, MetricCardSkeleton, ChartSectionSkeleton } from '@/components/ui/Skeleton';
import CustomDropdown from '@/components/ui/CustomDropdown';

function ReportsLoadingSkeleton() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ChartSectionSkeleton />
        </div>
        <div className="lg:col-span-4">
          <ChartSectionSkeleton />
        </div>
      </div>
    </div>
  );
}
const COLORS = ['#1D4ED8', '#F59E0B', '#14B8A6', '#8B5CF6', '#EF4444', '#10B981', '#EC4899', '#F97316'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormat = (value: any) => [`GH₵ ${Number(value).toFixed(2)}`, undefined];

export default function ReportsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState('12m');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const rangeOptions = [
    { label: 'Last 12 Months', value: '12m' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'All Historical Data', value: 'all' }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = currentYear - i;
    return { label: y.toString(), value: y.toString() };
  });

  useEffect(() => {
    setMounted(true);
    fetchReports(range, selectedYear);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, selectedYear]);

  const fetchReports = async (currentRange: string, year: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('range', currentRange);
      if (year !== currentYear.toString()) params.set('year', year);
      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading && !data) {
    return <ReportsLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 w-full stagger-fade-in">
      {/* Page Header */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F172A] tracking-tight leading-none">Reports</h1>
            <p className="text-sm normal-case font-semibold text-slate-500 tracking-normal mt-2.5">Visual overview of the system</p>
          </div>

          <div className="actions-cluster flex items-center gap-3">
            <div className="w-full sm:w-32 shrink-0">
              <CustomDropdown
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
              />
            </div>
            <div className="w-full sm:w-44 shrink-0">
              <CustomDropdown
                value={range}
                onChange={setRange}
                options={rangeOptions}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="admin-stats-grid admin-stats-three">
        <StatCard label="Total income" value={`GH₵ ${(data?.monthlyData?.reduce((sum: number, item: {amount: number}) => sum + item.amount, 0) || 0).toLocaleString()}`} icon={TrendUp} detail="Selected reporting period"/>
        <StatCard label="Members" value={(data?.institutionStats?.reduce((sum: number, item: {value: number}) => sum + item.value, 0) || 0).toLocaleString()} icon={Users} detail="Across included chapters"/>
        <StatCard label="Average attendance" value={(data?.attendanceStats?.avgAttendance || 0).toFixed(1)} icon={ChartLineUp} detail="People per session"/>
      </div>

      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        <section className="lg:col-span-8 card-premium p-4 sm:p-6 lg:p-10 relative overflow-hidden h-fit hover:border-[#1D4ED8]/25 transition-all duration-300">
          <div className="relative mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-black/5">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">Monthly Income</h3>
            <p className="text-sm font-semibold normal-case tracking-normal text-[#64748B] mt-1">Income by month</p>
          </div>
          <div className="h-[250px] sm:h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyData || []}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 700}} />
                <Tooltip
                  formatter={tooltipFormat}
                  contentStyle={{ borderRadius: '0px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '16px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1D4ED8" fillOpacity={1} fill="url(#velocityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-4 card-premium p-4 sm:p-6 lg:p-10 relative overflow-hidden flex flex-col hover:border-[#1D4ED8]/25 transition-all duration-300">
          <div className="relative mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-black/5">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">Funds Breakdown</h3>
            <p className="text-sm font-semibold normal-case tracking-normal text-[#64748B] mt-1">Funds by category</p>
          </div>
          <div className="h-[200px] sm:h-[280px] mb-8 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryStats || [{ name: 'Empty', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {(data?.categoryStats || [{ name: 'Empty', value: 1 }]).map((entry: Record<string, unknown>, index: number) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={tooltipFormat}
                  contentStyle={{ borderRadius: '0px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 relative z-10">
            {// eslint-disable-next-line @typescript-eslint/no-explicit-any
            data?.categoryStats?.map((s: any, i: number) => (
              <div key={`${s.name}-${s.type}-${i}`} className="flex items-center justify-between p-4 bg-slate-50/80 border border-black/5 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }}></span>
                  <span className="text-sm font-semibold text-[#0F172A]">{s.name}</span>
                </div>
                <span className="text-sm font-semibold text-[#0F172A] bg-white px-2.5 py-1 border border-black/5">
                  {((s.value as number / (data?.categoryStats?.reduce((a: number,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    b: any) => a + (b.value as number), 0) || 1)) * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
