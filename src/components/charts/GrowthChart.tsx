'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface GrowthChartProps {
  data: { name: string; value: number }[];
  role: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data, role }) => {
  const isNational = role === 'NATIONAL_ADMIN';

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip 
            cursor={{ fill: '#E2E8F0' }}
            formatter={(value: unknown) => [Number(value as number).toFixed(2), undefined]}
            contentStyle={{ 
              borderRadius: '0px', 
              border: 'none', 
              fontSize: '12px',
              fontWeight: 'BOLD'
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={isNational ? 25 : 40}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index % 2 === 0 ? '#10B981' : '#E2E8F0'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
