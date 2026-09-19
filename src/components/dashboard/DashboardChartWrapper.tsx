'use client';

import React, { useState, useEffect } from 'react';
import NationalAnalytics from './NationalAnalytics';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface DashboardChartWrapperProps {
  availableYears: number[];
}

export default function DashboardChartWrapper({ availableYears }: DashboardChartWrapperProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const yearOptions = availableYears.map(y => ({
    label: y.toString(),
    value: y.toString()
  }));

  useEffect(() => {
    fetchChartData(selectedYear);
  }, [selectedYear]);

  const fetchChartData = async (year: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?year=${year}`);
      const data = await res.json();
      if (res.ok) {
        const monthly = data.monthlyRegistrations || [];
        const institutionsCount = monthly.reduce((a: number, b: { value: number }) => a + b.value, 0);
        setChartData(institutionsCount === 0
          ? monthly.map((m: { name: string }, i: number) => ({
              name: m.name,
              value: i === new Date(parseInt(year), 0).getMonth() ? 1 : 0
            }))
          : monthly
        );
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-8 card-premium p-6 flex flex-col justify-between hover:border-[#1E67FC]/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Chapter Growth</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {chartData.reduce((a: number, b: { value: number }) => a + b.value, 0)}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              New Chapter{chartData.reduce((a: number, b: { value: number }) => a + b.value, 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="w-32">
          <CustomDropdown
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
          />
        </div>
      </div>
      <div className="flex-1 mt-2">
        {loading ? (
          <div className="h-[200px] bg-slate-50 animate-pulse" />
        ) : (
          <NationalAnalytics chartData={chartData} />
        )}
      </div>
    </div>
  );
}
