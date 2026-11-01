import Link from 'next/link';

type Entry = { id: string; name: string; category?: string; date: Date; amount: number };

export default function RecentCollections({ entries, className = '' }: { entries: Entry[]; className?: string }) {
  return (
    <section className={`card-premium recent-collections ${className}`}>
      <header className="recent-collections-header">
        <h3>Recent collections</h3>
        <Link href="/collections">View all</Link>
      </header>
      {entries.length > 0 ? (
        <ul className="recent-collections-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div className="recent-collections-identity">
                <p>{entry.name}</p>
                <span>{entry.category ? `${entry.category} · ` : ''}{entry.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <strong>GH&#8373; {entry.amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </li>
          ))}
        </ul>
      ) : <p className="recent-collections-empty">No collections recorded yet.</p>}
    </section>
  );
}
