'use client';

import React, { useState, useRef, useSyncExternalStore } from 'react';
import { 
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsProps {
  chartData: { name: string; value: number }[];
}

export default function NationalAnalytics({ chartData }: AnalyticsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  // Dynamically calculate the highest value in the chart data
  const maxVal = Math.max(...chartData.map(d => d.value), 0);
  
  // Chart height adapts strictly to the maximum value to avoid vertical stretching but stretched up for perfect spacing
  const chartHeight = maxVal <= 1 ? 200 : maxVal <= 3 ? 230 : 260;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ width: '100%', height: chartHeight }} className="transition-all duration-500">
        {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} 
              dy={10}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              hide={true}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F172A] text-white px-3 py-1.5 text-[10px] font-bold border border-slate-800 tracking-wider">
                      {payload[0].payload.name}: {payload[0].value} New Chapter{payload[0].value !== 1 ? 's' : ''}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={44}>
              {chartData.map((entry, index) => {
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#1E67FC"
                    fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.45}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    style={{ 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
