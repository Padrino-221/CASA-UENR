'use client';

import React from 'react';
import { Buildings, Crown, Users } from '@phosphor-icons/react';

interface RegionalAnalyticsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any[];
}

export default function RegionalAnalytics({ chartData }: RegionalAnalyticsProps) {
  // Sort descending by value (member count) so the highest is actually rank #1!
  const sortedData = [...chartData].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full bg-white border border-black/5 overflow-hidden">
      {sortedData.length > 0 ? (
        <div className="divide-y divide-black/5">
          {sortedData.map((item, idx) => {
            const rank = idx + 1;

            return (
              <div 
                key={idx} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/50 transition-all duration-300 group"
              >
                {/* Left Side: Rank & Campus Information */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Elegant Rank Badge */}
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 font-extrabold text-sm border bg-slate-50 border-black/5 text-slate-500">
                    {rank}
                  </div>

                  {/* Campus details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm tracking-tight group-hover:text-[#1E67FC] transition-colors">
                        {item.name}
                      </h4>
                      {rank === 1 && (
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-amber-50 border border-amber-200/50 text-amber-700 px-2 py-0.5">
                          <Crown size={10} weight="fill" />
                          <span>Leader</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5 truncate max-w-[280px] sm:max-w-md">
                      {item.university || "University"} • {item.campus || "Main"}
                    </p>
                  </div>
                </div>

                {/* Right Side: Active Congregation Count */}
                <div className="flex items-center shrink-0">
                  {/* Active Count Pill */}
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-black/5 group-hover:bg-white group-hover:border-[#1E67FC]/20 transition-all">
                    <Users size={16} className="text-slate-400" weight="duotone" />
                    <div className="flex items-baseline gap-1 text-slate-700">
                      <span className="font-extrabold text-sm">{item.value}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">members</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-slate-50/50">
           <Buildings weight="duotone" className="text-slate-300 text-3xl mb-3" />
           <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">No Active Chapters</h3>
           <p className="text-slate-400 text-[11px] font-bold mt-1">Add chapters to populate the performance registry.</p>
        </div>
      )}
    </div>
  );
}
