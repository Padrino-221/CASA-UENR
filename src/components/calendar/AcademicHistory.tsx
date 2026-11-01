import React from 'react';
import {
  ClockCounterClockwise,
  Trash
} from '@phosphor-icons/react';

import { AcademicYear } from '@/types/models';
import { isLocalScope } from '@/lib/roles';

interface AcademicHistoryProps {
  previousYears: AcademicYear[];
  role: string | undefined;
  onDeleteYear: (id: string) => void;
}

export const AcademicHistory: React.FC<AcademicHistoryProps> = ({ previousYears, role, onDeleteYear }) => {
  const isLocalAdmin = isLocalScope(role);

  return (
    <section className="academic-history">
      <header><ClockCounterClockwise size={20} /><h3>Academic history</h3><span>{previousYears.length}</span></header>
      {previousYears.length ? <div className="history-list">
        {previousYears.map((year) => (
          <article key={year.id}>
            <div><h4>{year.name}</h4><p>{new Date(year.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} &ndash; {new Date(year.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p><span>{year.semesters?.length || 0} semesters</span></div>
            {isLocalAdmin && <button className="cycle-icon-button cycle-danger" aria-label={`Delete ${year.name}`} onClick={() => onDeleteYear(year.id)}><Trash size={17} /></button>}
          </article>
        ))}
      </div> : <div className="calendar-empty"><p>No previous academic years.</p><span>Past years will appear here when a new cycle begins.</span></div>}
    </section>
  );
};
