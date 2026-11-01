import type { Icon } from '@phosphor-icons/react';

interface StatCardProps {
  label: string;
  value: string;
  icon: Icon;
  detail?: string;
}

export default function StatCard({ label, value, icon: IconComponent, detail }: StatCardProps) {
  const currency = value.startsWith('GH₵ ');
  const amount = currency ? value.slice(4) : value;
  return <article className="admin-stat-card" aria-label={label}>
    <div className="admin-stat-top"><p className="admin-stat-label">{label}{currency && <span className="admin-stat-currency">GHS</span>}</p><span className="admin-stat-icon"><IconComponent size={21} weight="regular" aria-hidden="true"/></span></div>
    <p className={`admin-stat-value${currency ? ' admin-stat-money' : ''}`}>{amount}</p>
    {detail && <p className="admin-stat-detail">{detail}</p>}
  </article>;
}
