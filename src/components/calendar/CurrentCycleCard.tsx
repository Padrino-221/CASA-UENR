import React, { useMemo } from 'react';
import {
  Lock,
  Pencil,
  Play,
  Plus,
  Trash,
} from '@phosphor-icons/react';

import { AcademicYear, Semester } from '@/types/models';
import { isLocalScope } from '@/lib/roles';

interface CurrentCycleCardProps {
  currentYear: AcademicYear;
  role: string | undefined;
  onEditYear: (year: AcademicYear) => void;
  onDeleteYear: (id: string) => void;
  onAddSemester: (yearId: string) => void;
  onEditSemester: (sem: Semester) => void;
  onDeleteSemester: (id: string) => void;
  onToggleSemester: (id: string) => void;
}

export const CurrentCycleCard: React.FC<CurrentCycleCardProps> = ({
  currentYear, role, onEditYear, onDeleteYear, onAddSemester, onEditSemester, onDeleteSemester, onToggleSemester
}) => {
  const isLocalAdmin = isLocalScope(role);
  const semesterProgressMap = useMemo(() => {
    const now = Date.now(); // eslint-disable-line react-hooks/purity
    const map = new Map<string, number>();
    (currentYear.semesters || []).forEach(sem => {
      const start = new Date(sem.startDate).getTime();
      const end = new Date(sem.endDate).getTime();
      if (isNaN(start) || isNaN(end)) { map.set(sem.id, 0); return; }
      if (now < start) { map.set(sem.id, 0); return; }
      if (now > end) { map.set(sem.id, 100); return; }
      map.set(sem.id, Math.round(((now - start) / (end - start)) * 100));
    });
    return map;
  }, [currentYear.semesters]);

  const formatDate = (value: string | Date) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="cycle-card">
      <header className="cycle-header">
        <div className="cycle-heading">
          <span className="cycle-eyebrow">Academic year</span>
          <h2>{currentYear.name}</h2>
          <p>{formatDate(currentYear.startDate)} &ndash; {formatDate(currentYear.endDate)}</p>
          <span className="cycle-status">{currentYear.isCurrent ? 'Current year' : 'Academic year'}</span>
        </div>
        {isLocalAdmin && (
          <div className="cycle-year-actions">
            <button className="cycle-icon-button" aria-label="Edit academic year" onClick={() => onEditYear(currentYear)}><Pencil size={18} /></button>
            <button className="cycle-icon-button cycle-danger" aria-label="Delete academic year" onClick={() => onDeleteYear(currentYear.id)}><Trash size={18} /></button>
          </div>
        )}
      </header>
      <div className="cycle-semesters-heading">
        <h3>Semesters <span>{currentYear.semesters?.length || 0}</span></h3>
        {isLocalAdmin && <button className="cycle-add" onClick={() => onAddSemester(currentYear.id)}><Plus size={17} /> Add semester</button>}
      </div>
      <div className="cycle-semesters">
        {currentYear.semesters?.length ? currentYear.semesters.map((sem: Semester) => (
          <article key={sem.id} className="semester-card">
            <div className="semester-heading">
              <h4>{sem.name}</h4>
              <span className={`semester-status ${sem.status === 'ACTIVE' ? 'is-active' : ''}`}>{sem.status.toLowerCase().replace(/_/g, ' ')}</span>
            </div>
            <p className="semester-dates">{formatDate(sem.startDate)} &ndash; {formatDate(sem.endDate)}</p>
            {sem.status === 'ACTIVE' && (
              <div className="semester-progress">
                <div role="progressbar" aria-label={`${sem.name} elapsed`} aria-valuenow={semesterProgressMap.get(sem.id) ?? 0} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${semesterProgressMap.get(sem.id) ?? 0}%` }} /></div>
                <span>{semesterProgressMap.get(sem.id) ?? 0}% elapsed</span>
              </div>
            )}
            {isLocalAdmin && (
              <div className="semester-actions">
                <button className="cycle-icon-button" aria-label={`Edit ${sem.name}`} onClick={() => onEditSemester(sem)}><Pencil size={17} /></button>
                <button className="cycle-icon-button cycle-danger" aria-label={`Delete ${sem.name}`} onClick={() => onDeleteSemester(sem.id)}><Trash size={17} /></button>
                <button className={`semester-toggle ${sem.status === 'ACTIVE' ? 'cycle-danger' : ''}`} onClick={() => onToggleSemester(sem.id)}>
                  {sem.status === 'ACTIVE' ? <><Lock size={16} /> Close semester</> : <><Play size={16} /> Activate semester</>}
                </button>
              </div>
            )}
          </article>
        )) : <p className="calendar-empty">No semesters yet. Add a semester to set up this academic year.</p>}
      </div>
    </section>
  );
};
