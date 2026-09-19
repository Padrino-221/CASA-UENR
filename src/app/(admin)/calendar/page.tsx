'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarBlank,
  CalendarCheck,
  Plus,
  TrendUp,
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import { useCalendar } from '@/hooks/useCalendar';
import { useChapters } from '@/hooks/useChapters';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { CurrentCycleCard } from '@/components/calendar/CurrentCycleCard';
import { AcademicHistory } from '@/components/calendar/AcademicHistory';
import { YearModal } from '@/components/calendar/YearModal';
import { SemesterModal } from '@/components/calendar/SemesterModal';
import { HeaderSkeleton } from '@/components/ui/Skeleton';
import { isLocalScope } from '@/lib/roles';
import { AcademicYear, Semester } from '@/types/models';

export default function CalendarPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { academicYears, loading, fetchCalendar, createYear, updateYear, deleteYear, createSemester, updateSemester, deleteSemester, toggleSemester, promoteStudents } = useCalendar();
  const { chapters: institutions } = useChapters();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');

  const [mounted, setMounted] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showEditYearModal, setShowEditYearModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);
  const [showEditSemModal, setShowEditSemModal] = useState(false);
  
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [targetYearId, setTargetYearId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCalendar(selectedInstitutionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstitutionId, mounted]);

  if (!mounted) return null;

  const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
  const previousYears = academicYears.filter(y => y.id !== currentYear?.id);

  if (loading && academicYears.length === 0) {
    return <CalendarLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 w-full">
      {/* Page Header with Terminology Realignment */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Calendar</h1>
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-2.5">Academic Calendar Configuration</p>
          </div>
 
          <div className="actions-cluster">
            {(role === 'NATIONAL_ADMIN' || role === 'REGIONAL_ADMIN') && (
              <div className="w-full sm:w-[260px] shrink-0">
                <CustomDropdown 
                  value={selectedInstitutionId}
                  onChange={setSelectedInstitutionId}
                  options={[
                    { label: 'All Chapters', value: '' },
                    ...institutions.map(inst => ({ label: inst.name, value: inst.id }))
                  ]}
                  placeholder="View Chapter Calendar"
                />
              </div>
            )}
 
            {isLocalScope(role) && (
              <button className="btn-glass-alt" onClick={promoteStudents}>
                <TrendUp size={18} weight="duotone" />
                <span>Run Academic Promotion</span>
              </button>
            )}
            {isLocalScope(role) && (
              <button className="btn-lux-primary" onClick={() => setShowYearModal(true)}>
                <Plus size={18} weight="duotone" />
                <span>New Academic Year</span>
              </button>
            )}
          </div>
        </div>
      </header>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 lg:space-y-8">
          {currentYear ? (
            <CurrentCycleCard 
              currentYear={currentYear} 
              role={role} 
              onEditYear={(y) => { setEditingYear(y); setShowEditYearModal(true); }}
              onDeleteYear={deleteYear}
              onAddSemester={(id) => { setTargetYearId(id); setShowSemModal(true); }}
              onEditSemester={(s) => { setEditingSem(s); setShowEditSemModal(true); }}
              onDeleteSemester={deleteSemester}
              onToggleSemester={toggleSemester}
            />
          ) : (
            <NoActiveYearView onInitialize={() => setShowYearModal(true)} role={role} />
          )}
 
          {/* Brutalist Luxury Governance Rule Card */}
          <div className="flex gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 bg-slate-50/50 border border-black/5 sm: items-center">
            <div className="w-12 h-12 bg-white border border-black/5 flex items-center justify-center text-[#1E67FC] flex-shrink-0">
              <CalendarCheck size={22} className="text-[#1E67FC]" weight="duotone" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">Note</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                Only one semester can be <strong className="text-[#1E67FC]">ACTIVE</strong> at a time. Activating a new semester will automatically finalize and archive the current cycle.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AcademicHistory previousYears={previousYears} role={role} onDeleteYear={deleteYear} />
        </div>
      </div>

      <YearModal 
        isOpen={showYearModal} 
        onClose={() => setShowYearModal(false)} 
        onSubmit={(p) => { createYear(p); setShowYearModal(false); }} 
        institutions={institutions}
      />
      <YearModal 
        isOpen={showEditYearModal} 
        onClose={() => setShowEditYearModal(false)} 
        editingYear={editingYear} 
        onSubmit={(p) => { updateYear(editingYear!.id, p); setShowEditYearModal(false); }} 
        institutions={institutions}
      />
      <SemesterModal isOpen={showSemModal} onClose={() => setShowSemModal(false)} onSubmit={(p) => { createSemester(targetYearId, p); setShowSemModal(false); }} />
      <SemesterModal isOpen={showEditSemModal} onClose={() => setShowEditSemModal(false)} editingSem={editingSem} onSubmit={(p) => { updateSemester(editingSem!.id, p); setShowEditSemModal(false); }} />
    </div>
  );
}

function NoActiveYearView({ onInitialize, role }: { onInitialize: () => void; role?: string }) {
  const isLocalAdmin = isLocalScope(role);

  return (
    <section className="bg-white border-2 border-dashed border-black/5 p-6 sm:p-10 lg:p-16 text-center">
      <div className="w-20 h-20 bg-slate-50 border border-black/5 flex items-center justify-center mx-auto mb-8 text-slate-300">
        <CalendarBlank size={36} weight="duotone" />
      </div>
      <h3 className="text-2xl font-black text-[#0F172A] mb-3">No Active Academic Year</h3>
      <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed mb-8">
        {isLocalAdmin 
          ? "Add a new academic year to start tracking progress."
          : "No active academic cycle for this chapter."}
      </p>
      {isLocalAdmin && (
        <button 
          className="btn-lux-primary h-14 px-10 flex items-center gap-3 mx-auto" 
          onClick={onInitialize}
        >
          <Plus size={20} weight="duotone" />
          <span>Set Up Year</span>
        </button>
      )}
    </section>
  );
}

function CalendarLoadingSkeleton() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="h-[500px] bg-slate-50/50 border border-black/5 animate-pulse" />
        </div>
        <div className="lg:col-span-5">
          <div className="h-[600px] bg-slate-50/50 border border-black/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
