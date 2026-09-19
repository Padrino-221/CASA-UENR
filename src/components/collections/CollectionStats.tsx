import React from 'react';
import {
  TrendUp,
  ArrowUpRight,
  Wallet
} from '@phosphor-icons/react';


interface CollectionStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const CollectionStats: React.FC<CollectionStatsProps> = ({ totalIncome, totalExpense, balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="card ! border-black/5 bg-white p-8 flex items-center gap-6 group cursor-pointer transition-all hover:border-emerald-200">
        <div className="w-16 h-16 bg-emerald-600 text-white flex items-center justify-center ring-6 ring-emerald-50 shrink-0 transition-transform group-hover:scale-105">
          <TrendUp size={24} weight="duotone" />
        </div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">Total Income</span>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1 tracking-tight">GH₵ {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-emerald-600 font-extrabold text-[10px] mt-2 flex items-center gap-1">
            Spiritual Contributions
          </span>
        </div>
      </div>
      <div className="card ! border-black/5 bg-white p-8 flex items-center gap-6 group cursor-pointer transition-all hover:border-rose-200">
        <div className="w-16 h-16 bg-rose-600 text-white flex items-center justify-center ring-6 ring-rose-50 shrink-0 transition-transform group-hover:scale-105">
          <ArrowUpRight size={24} className="rotate-90" weight="duotone" />
        </div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">Total Expenses</span>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1 tracking-tight">GH₵ {totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-rose-500 font-extrabold text-[10px] mt-2">Operational Outflow</span>
        </div>
      </div>
      <div className="card ! border-black/5 bg-white p-8 flex items-center gap-6 group cursor-pointer transition-all hover:border-[#1E67FC]/30">
        <div className="w-16 h-16 bg-[#1E67FC] text-white flex items-center justify-center ring-6 ring-[#EBF2FF] shrink-0 transition-transform group-hover:scale-105">
          <Wallet size={24} weight="duotone" />
        </div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">Net Balance</span>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1 tracking-tight">GH₵ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-[#1E67FC] font-extrabold text-[10px] mt-2">Institutional Liquidity</span>
        </div>
      </div>
    </div>
  );
};
