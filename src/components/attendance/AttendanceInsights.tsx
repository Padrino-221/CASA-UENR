'use client';
import { CustomDatePicker } from '@/components/ui/CustomDateTimePicker';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useSession } from 'next-auth/react';
import {
  TrendUp,
  Users,
  CaretDown,
  CaretRight,
  ShieldCheck,
  Warning,
  ChartLineUp
} from '@phosphor-icons/react';
import CustomDropdown from '@/components/ui/CustomDropdown';

const EXEC_COLORS: Record<string, string> = {
  Excellent: '#10B981',
  Good: '#3B82F6',
  Fair: '#F59E0B',
  Indifferent: '#EF4444'
};

const tooltipStyle = {
  borderRadius: '0px',
  border: '1px solid rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(10px)',
  padding: '12px'
};

interface InsightSummary {
  totalSessions: number;
  avgAttendance: number;
  totalAttendance: number;
  periodStart: string | null;
  periodEnd: string | null;
}

interface ChallengeItem {
  challenge: string;
  count: number;
  percentage: number;
}

interface TrendItem {
  month: string;
  avgAttendance: number;
  totalSessions: number;
}

interface InsightsData {
  summary: InsightSummary;
  challengeFrequency: ChallengeItem[];
  attendanceTrends: TrendItem[];
  executiveHealth: { attitude: string; count: number; percentage: number }[];
  serviceTypeBreakdown: { serviceType: string; avgAttendance: number; totalSessions: number }[];
  chapterComparison: { chapterName: string; avgAttendance: number; totalSessions: number }[];
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen,
  children
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const id = title.replace(/\s+/g, '-').toLowerCase();

  return (
    <section className="card-premium p-4 sm:p-6 lg:p-8 relative overflow-hidden hover:border-[#1D4ED8]/25 transition-all duration-300">

      <button aria-label="Next page"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`section-${id}`}
        className="relative w-full flex items-center justify-between text-left mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-[#EBF2FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-[13px] font-semibold normal-case tracking-normal text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <span className="text-[#64748B] transition-transform duration-200 shrink-0 ml-4">
          {open ? <CaretDown size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
        </span>
      </button>
      {open && (
        <div id={`section-${id}`} className="relative z-10">
          {children}
        </div>
      )}
    </section>
  );
}

export default function AttendanceInsights() {
  const { data: session } = useSession();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [serviceType, setServiceType] = useState('');

  const role = session?.user?.role;
  const isNationalOrRegional = role === 'NATIONAL_ADMIN' || role === 'REGIONAL_ADMIN';

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (serviceType) params.set('serviceType', serviceType);

      const res = await fetch(`/api/attendance/insights?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, serviceType]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const serviceTypeOptions = [
    { label: 'All Services', value: '' },
    { label: 'Sunday Service', value: 'Sunday Service' },
    { label: 'Bible Study', value: 'Bible Study' },
    { label: 'Prayer Meeting', value: 'Prayer Meeting' },
    { label: 'Midweek Service', value: 'Midweek Service' },
    { label: 'Special Service', value: 'Special Service' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-100" />
          ))}
        </div>
        <div className="h-72 bg-slate-100" />
        <div className="h-72 bg-slate-100" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-slate-50/30 border border-slate-200">
        <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-300 mb-5 border border-slate-200">
          <ChartLineUp size={32} weight="duotone" />
        </div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-1">No attendance data available</h3>
        <p className="text-slate-500 text-sm font-semibold max-w-xs leading-relaxed">Record attendance sessions to generate insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full stagger-fade-in">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 bg-slate-50/60 p-4 sm:p-6 border border-slate-200">
        <CustomDatePicker label="From" value={dateFrom} onChange={setDateFrom} className="w-full sm:w-52" />
        <CustomDatePicker label="To" value={dateTo} onChange={setDateTo} className="w-full sm:w-52" />
        <div className="w-full sm:w-44">
          <CustomDropdown
            label="Service Type"
            value={serviceType}
            onChange={setServiceType}
            options={serviceTypeOptions}
          />
        </div>
        {(dateFrom || dateTo || serviceType) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setServiceType(''); }}
            className="px-5 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-[13px] normal-case tracking-normal transition-all"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="card-premium p-4 sm:p-6 lg:p-8 !flex-row !items-center gap-4 sm:gap-6 group transition-all duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1D4ED8] text-white flex items-center justify-center ring-4 sm:ring-6 ring-[#1D4ED8]/15 shrink-0 transition-transform ">
            <TrendUp size={18} className="sm:hidden" weight="duotone" />
            <TrendUp size={24} className="hidden sm:block" weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[13px] normal-case font-semibold tracking-normal text-[#64748B] block mb-1">Total Sessions</span>
            <h3 className="text-lg sm:text-2xl font-semibold text-[#0F172A] tracking-tight">{data.summary.totalSessions}</h3>
          </div>
        </div>

        <div className="card-premium p-4 sm:p-6 lg:p-8 !flex-row !items-center gap-4 sm:gap-6 group transition-all duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#10B981] text-white flex items-center justify-center ring-4 sm:ring-6 ring-[#10B981]/15 shrink-0 transition-transform ">
            <Users size={18} className="sm:hidden" weight="duotone" />
            <Users size={24} className="hidden sm:block" weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[13px] normal-case font-semibold tracking-normal text-[#64748B] block mb-1">Average Attendance</span>
            <h3 className="text-lg sm:text-2xl font-semibold text-[#0F172A] tracking-tight">{data.summary.avgAttendance}</h3>
          </div>
        </div>

        <div className="card-premium p-4 sm:p-6 lg:p-8 !flex-row !items-center gap-4 sm:gap-6 group transition-all duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F59E0B] text-white flex items-center justify-center ring-4 sm:ring-6 ring-[#F59E0B]/15 shrink-0 transition-transform ">
            <ChartLineUp size={18} className="sm:hidden" weight="duotone" />
            <ChartLineUp size={24} className="hidden sm:block" weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[13px] normal-case font-semibold tracking-normal text-[#64748B] block mb-1">Total Attendance</span>
            <h3 className="text-lg sm:text-2xl font-semibold text-[#0F172A] tracking-tight">{data.summary.totalAttendance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Challenge Frequency */}
      <CollapsibleSection title="Challenges Encountered" subtitle="Issues affecting church services" icon={<Warning size={20} weight="duotone" />} defaultOpen>
        {data.challengeFrequency.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, data.challengeFrequency.length * 44)}>
            <BarChart data={data.challengeFrequency} layout="vertical" margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} />
              <YAxis
                dataKey="challenge"
                type="category"
                width={150}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#0F172A', fontSize: 13, fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: unknown) => [`${value} session${(value as number) !== 1 ? 's' : ''}`, '']}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#1D4ED8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="relative z-10 py-12 text-center bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 bg-white flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-200">
              <Warning size={24} weight="duotone" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No challenges reported yet</p>
            <p className="text-[13px] font-bold text-slate-500 mt-1">Challenges are recorded in the session report form.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Attendance Trends */}
      <CollapsibleSection title="Attendance Trends" subtitle="Monthly average attendance" icon={<ChartLineUp size={20} weight="duotone" />} defaultOpen>
        {data.attendanceTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.attendanceTrends} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="avgAttendance"
                stroke="#1D4ED8"
                strokeWidth={3}
                dot={{ fill: '#1D4ED8', strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, stroke: '#1D4ED8', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="relative z-10 py-12 text-center bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 bg-white flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-200">
              <ChartLineUp size={24} weight="duotone" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No trend data available</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Executive Health */}
      <CollapsibleSection title="Executive Health" subtitle="Leadership attitude (Excellent → Indifferent)" icon={<ShieldCheck size={20} weight="duotone" />}>
        {data.executiveHealth.some(e => e.count > 0) ? (
          <div className="space-y-4">
            {data.executiveHealth.map((entry) => (
              <div key={entry.attitude} className="flex items-center gap-4">
                <span className="w-24 text-sm font-semibold text-[#0F172A] shrink-0">{entry.attitude}</span>
                <div className="flex-1 h-10 bg-slate-50 overflow-hidden relative border border-slate-200">
                  <div
                    className="h-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${entry.percentage}%`,
                      minWidth: entry.count > 0 ? '62px' : '0px',
                      background: EXEC_COLORS[entry.attitude] ?? '#64748B'
                    }}
                  >
                    {entry.count > 0 && (
                      <span className="text-[13px] font-semibold text-white">{entry.count}</span>
                    )}
                  </div>
                </div>
                <span className="w-12 text-right text-sm font-semibold text-[#0F172A] shrink-0">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative z-10 py-12 text-center bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 bg-white flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-200">
              <ShieldCheck size={24} weight="duotone" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No executive ratings recorded</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Service Type */}
      <CollapsibleSection title="Service Type Attendance" subtitle="Average attendance by service category" icon={<ChartLineUp size={20} weight="duotone" />}>
        {data.serviceTypeBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.serviceTypeBreakdown} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="serviceType" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgAttendance" radius={[8, 8, 0, 0]} fill="#14B8A6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="relative z-10 py-12 text-center bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">No service type data</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Chapter Comparison */}
      {isNationalOrRegional && data.chapterComparison.length > 0 && (
        <CollapsibleSection title="Chapter Comparison" subtitle="Average attendance per chapter" icon={<Users size={20} weight="duotone" />}>
          <ResponsiveContainer width="100%" height={Math.max(200, data.chapterComparison.length * 44)}>
            <BarChart data={data.chapterComparison} layout="vertical" margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} />
              <YAxis
                dataKey="chapterName"
                type="category"
                width={140}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#0F172A', fontSize: 13, fontWeight: 700 }}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => [`${value} avg`, '']} />
              <Bar dataKey="avgAttendance" radius={[0, 8, 8, 0]} fill="#1D4ED8" />
            </BarChart>
          </ResponsiveContainer>
        </CollapsibleSection>
      )}
    </div>
  );
}
