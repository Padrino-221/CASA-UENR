'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarBlank,
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F172A] tracking-tight leading-none">Calendar</h1>
            <p className="text-[14px] normal-case font-semibold text-slate-400 tracking-normal mt-2.5">Manage academic years and semester schedules.</p>
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

      <div className="academic-calendar-layout">
        <div className="academic-calendar-main">
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

          <p className="calendar-note">Only one semester can be active at a time. Activating another semester closes the current one.</p>
        </div>

        <div className="academic-calendar-history">
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
      <h3 className="text-2xl font-semibold text-[#0F172A] mb-3">No Active Academic Year</h3>
      <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto leading-relaxed mb-8">
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
      <div className="admin-dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
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
