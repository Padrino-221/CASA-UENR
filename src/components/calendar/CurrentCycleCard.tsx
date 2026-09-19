import React, { useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarBlank,
  Clock,
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

  return (
    <section className="bg-white border border-black/5 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Premium background gradient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBF2FF] rounded-full blur-3xl -mr-32 -mt-32 opacity-70" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-black/5">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#1E67FC] text-white flex items-center justify-center ring-6 ring-[#EBF2FF] shrink-0">
            <CalendarBlank size={24} weight="duotone" />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{currentYear.name}</h2>
              <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-100/50">
                Active Cycle
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
              <Clock size={12} className="text-[#1E67FC]" weight="duotone" />
              <span>{new Date(currentYear.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-slate-300 mx-1">—</span>
              <span>{new Date(currentYear.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {isLocalAdmin && (
          <div className="flex items-center gap-4 shrink-0 border-t border-black/5 md:border-t-0 pt-4 md:pt-0 justify-end w-full md:w-auto relative z-10">
            {/* Unified Action Panel Container */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-black/5 p-1 shrink-0">
              <button 
                onClick={() => onEditYear(currentYear)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#1E67FC] hover:bg-[#EBF2FF] transition-all"
                title="Edit Year"
              >
                <Pencil size={13} weight="duotone" />
              </button>
              <button 
                onClick={() => onDeleteYear(currentYear.id)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Delete Year"
              >
                <Trash size={13} weight="duotone" />
              </button>
            </div>

            <button 
              onClick={() => onAddSemester(currentYear.id)}
              className="btn-lux-primary h-10 px-5 flex items-center justify-center gap-2 group text-xs font-black uppercase tracking-widest shrink-0"
            >
              <Plus size={14} className="group-hover:scale-110 transition-transform" weight="duotone" />
              <span>Add Semester</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentYear.semesters && currentYear.semesters.length > 0 ? (
          currentYear.semesters.map((sem: Semester) => (
            <div 
              key={sem.id} 
              className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-all border-2 gap-4 ${
                sem.status === 'ACTIVE' 
                  ? 'bg-white border-[#1E67FC]/20' 
                  : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 flex items-center justify-center transition-all shrink-0 ${
                  sem.status === 'ACTIVE' ? 'bg-[#1E67FC] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#EBF2FF] group-hover:text-[#1E67FC]'
                }`}>
                  {sem.status === 'ACTIVE' ? <Play size={18} fill="currentColor" weight="duotone" /> : <Clock size={18} weight="duotone" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-[#0F172A]">{sem.name}</h4>
                    {sem.status === 'ACTIVE' && (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse border border-white" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-80">
                    {new Date(sem.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} — {new Date(sem.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                  </p>
                  
                  {sem.status === 'ACTIVE' && (
                    <div className="mt-3.5 flex items-center gap-3">
                      <div className="w-40 sm:w-56 bg-slate-100 h-1.5 relative overflow-hidden shrink-0">
                        <div 
                          className="bg-[#1E67FC] h-1.5 transition-all duration-700" 
                          style={{ width: `${semesterProgressMap.get(sem.id) ?? 0}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#1E67FC] bg-[#EBF2FF] px-2 py-0.5 leading-none shrink-0">
                        {semesterProgressMap.get(sem.id) ?? 0}% Elapsed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isLocalAdmin && (
                <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-black/5 sm:border-t-0 pt-4 sm:pt-0">
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all mr-2">
                    <button 
                      onClick={() => onEditSemester(sem)}
                      className="p-2.5 text-slate-400 hover:text-[#1E67FC] hover:bg-[#EBF2FF] transition-all"
                      title="Edit Semester"
                    >
                      <Pencil size={14} weight="duotone" />
                    </button>
                    <button 
                      onClick={() => onDeleteSemester(sem.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete Semester"
                    >
                      <Trash size={14} weight="duotone" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => onToggleSemester(sem.id)}
                    className={`h-11 px-5 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                      sem.status === 'ACTIVE' 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100/80' 
                        : 'bg-[#EBF2FF] text-[#1E67FC] hover:bg-[#1E67FC]/10'
                    }`}
                  >
                    {sem.status === 'ACTIVE' ? (
                      <><Lock size={13} weight="duotone" /> Close</>
                    ) : (
                      <><Play size={13} weight="duotone" /> Activate</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 border-2 border-dashed border-black/5">
            <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-200 mb-4 border border-black/5">
              <CalendarBlank size={32} weight="duotone" />
            </div>
            <p className="text-slate-400 font-bold text-sm">No semesters initialized yet.</p>
            <p className="text-slate-300 text-xs mt-1">Add a semester to begin tracking this academic year.</p>
          </div>
        )}
      </div>
    </section>
  );
};
