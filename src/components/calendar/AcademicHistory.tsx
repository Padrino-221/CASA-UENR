import React from 'react';
import {
  ClockCounterClockwise,
  Trash,
  CheckCircle
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
    <section className="bg-white border border-black/5 overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8 border-b border-black/5 bg-slate-50/50 flex items-center gap-4">
        <div className="w-10 h-10 bg-white border border-black/5 flex items-center justify-center text-slate-400 shrink-0">
           <ClockCounterClockwise size={18} className="text-[#1E67FC]" weight="duotone" />
        </div>
        <h3 className="font-black text-[#0F172A] uppercase tracking-widest text-[11px]">Academic History</h3>
      </div>
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {previousYears.map((year: AcademicYear) => (
          <div key={year.id} className="p-6 border border-black/5 hover:bg-slate-50/50 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#0F172A]">{year.name}</span>
                {isLocalAdmin && (
                  <button 
                    onClick={() => onDeleteYear(year.id)}
                    className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Delete Record"
                  >
                    <Trash size={12} weight="duotone" />
                  </button>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-black text-[#1E67FC] uppercase tracking-widest bg-[#EBF2FF] border border-[#1E67FC]/10 px-2.5 py-1 shrink-0">
                <CheckCircle size={11} weight="duotone" />
                Completed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/5">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Timeline</span>
                <span className="text-xs font-extrabold text-slate-600 mt-0.5">{new Date(year.startDate).getFullYear()} - {new Date(year.endDate).getFullYear()}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Units</span>
                <span className="text-xs font-extrabold text-slate-600 mt-0.5">{year.semesters?.length || 0} Semesters</span>
              </div>
            </div>
          </div>
        ))}
        {previousYears.length === 0 && (
          <div className="py-20 text-center">
            <ClockCounterClockwise size={32} className="mx-auto text-slate-200 mb-3" weight="duotone" />
            <p className="text-slate-400 text-xs font-extrabold italic">No historical records archived.</p>
          </div>
        )}
      </div>
    </section>
  );
};
