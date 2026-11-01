import { TrendUp, ArrowUpRight, Wallet } from '@phosphor-icons/react';
import StatCard from '@/components/dashboard/StatCard';
interface CollectionStatsProps { totalIncome: number; totalExpense: number; balance: number; }
export function CollectionStats({ totalIncome, totalExpense, balance }: CollectionStatsProps) {
  const money = (amount: number) => `GH₵ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return <div className="admin-stats-grid admin-stats-three">
    <StatCard label="Total income" value={money(totalIncome)} icon={TrendUp} detail="Recorded income"/>
    <StatCard label="Total expenses" value={money(totalExpense)} icon={ArrowUpRight} detail="Recorded expenses"/>
    <StatCard label="Net balance" value={money(balance)} icon={Wallet} detail="Income less expenses"/>
  </div>;
}
