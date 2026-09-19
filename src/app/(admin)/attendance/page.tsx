'use client';

import { isLocalScope } from '@/lib/roles';

import React, { useState, useEffect } from 'react';
import { HeaderSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';
import {
  ShieldCheck,
  Plus,
  CaretRight,
} from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';
import { Pagination } from '@/components/ui/Pagination';

import AttendanceInsights from '@/components/attendance/AttendanceInsights';

export default function AttendancePage() {
  const { data: session } = useSession();
  const notification = useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'sessions' | 'insights'>('sessions');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New session form
  const [serviceType, setServiceType] = useState('Sunday Service');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle, selectedCampus]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attendance/sessions');
      const data = await res.json();
      if (res.ok) {
        setSessions(data);
      } else {
        notification.error('Failed to load sessions.');
      }
    } catch {
      notification.error('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, title, date })
      });
      if (res.ok) {
        notification.success('Session initialized successfully.');
        setIsModalOpen(false);
        fetchSessions();
        setTitle('');
      } else {
        notification.error('Failed to create session.');
      }
    } catch {
      notification.error('Communication error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-8 w-full stagger-fade-in">
        <HeaderSkeleton />
        <TableAreaSkeleton />
      </div>
    );
  }

  const isLocalAdmin = isLocalScope(session?.user?.role);

  const uniqueCampuses = Array.from(
    new Set(sessions.map(s => s.chapter?.name).filter(Boolean))
  );

  const campusOptions = [
    { label: 'All Chapters', value: 'ALL' },
    ...uniqueCampuses.map(campus => ({ label: campus, value: campus }))
  ];

  const filteredSessions = sessions.filter(sessionItem => {
    const matchesTitle = searchTitle.trim() === '' ||
      (sessionItem.title || '').toLowerCase().includes(searchTitle.toLowerCase());
    const matchesCampus = selectedCampus === 'ALL' ||
      sessionItem.chapter?.name === selectedCampus;
    return matchesTitle && matchesCampus;
  });

  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 w-full">
      {/* Page Header */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Attendance</h1>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Manage attendance</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-end">
            <nav className="flex bg-slate-100 p-1" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'sessions'}
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-white text-[#0F172A]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sessions
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'insights'}
                onClick={() => setActiveTab('insights')}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-white text-[#0F172A]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Insights
              </button>
            </nav>
            {isLocalAdmin && activeTab === 'sessions' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-lux-primary"
              >
                <Plus size={20} weight="bold" />
                <span>New Session</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'sessions' ? (
        <>
          {/* Premium Filter Controls */}
          {sessions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-50/50 p-4 border border-black/5 items-center justify-between">
              <div className="flex items-center gap-3 w-full md:w-80">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Filter by session title..."
                    className="w-full pl-4 pr-4 py-3.5 bg-white border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-xs text-[#0F172A] placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <CustomDropdown
                    value={selectedCampus}
                    onChange={setSelectedCampus}
                    options={campusOptions}
                  />
                </div>
                {(searchTitle || selectedCampus !== 'ALL') && (
                  <button
                    onClick={() => { setSearchTitle(''); setSelectedCampus('ALL'); }}
                    className="px-4 py-3.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-black text-xs uppercase tracking-widest transition-all shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Attendance Sessions Table */}
          {sessions.length > 0 ? (
            <div className="card table-card overflow-hidden ! border-black/5">
              <div className="overflow-x-auto">
                <table className="ds-table w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Session</th>
                    <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Chapter</th>
                    <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Date</th>
                    <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Attendance</th>
                    <th className="bg-slate-50/50 p-6 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.length > 0 ? (
                    paginatedSessions.map((sessionItem) => (
                      <tr key={sessionItem.id} className="border-b border-black/5 last:border-0 hover:bg-slate-50/40 transition-colors">
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0F172A]">{sessionItem.title || 'Untitled Session'}</span>
                            <span className="text-[9px] text-[#1E67FC] uppercase font-black tracking-widest mt-0.5 w-fit bg-[#EBF2FF] px-1.5 py-0.5 rounded">
                              {sessionItem.serviceType}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="font-semibold text-xs text-[#0F172A]">{sessionItem.chapter?.name || 'Unassigned'}</span>
                        </td>
                        <td className="p-6">
                          <span className="text-slate-500 font-extrabold text-xs">
                            {new Date(sessionItem.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#1E67FC]" />
                            <span className="font-black text-[#0F172A] text-xs uppercase tracking-tighter">
                              {sessionItem.totalAttendance !== null && sessionItem.totalAttendance !== undefined
                                ? `${sessionItem.totalAttendance} Present`
                                : `${sessionItem._count?.records || 0} Present`}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <Link
                            href={`/attendance/${sessionItem.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF2FF] hover:bg-[#1E67FC] text-[#1E67FC] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            <span>Enter</span>
                            <CaretRight size={12} weight="bold" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-xs border-none">
                        No matching sessions found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                startItem={startIndex + 1}
                endItem={endIndex}
                totalItems={totalItems}
                itemLabel="sessions"
                onPrevious={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              />
            </div>
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-slate-50/30 border border-black/5">
              <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-300 mb-5 border border-black/5">
                <ShieldCheck size={32} weight="duotone" />
              </div>
              <h3 className="text-lg font-black text-[#0F172A] mb-1">No active sessions found</h3>
              <p className="text-slate-400 text-xs font-extrabold max-w-xs leading-relaxed">Start your first attendance session to begin tracking membership engagement.</p>
            </div>
          )}
        </>
      ) : (
        <AttendanceInsights />
      )}

      {/* Modal for New Session */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Session"
        maxWidth="max-w-md"
        overflowVisible={true}
      >
        <form onSubmit={handleCreateSession} className="space-y-5">
          <CustomDropdown
            label="Category"
            value={serviceType}
            onChange={setServiceType}
            options={[
              { label: 'Sunday Service', value: 'Sunday Service' },
              { label: 'Bible Study', value: 'Bible Study' },
              { label: 'Prayer Meeting', value: 'Prayer Meeting' },
              { label: 'Midweek Service', value: 'Midweek Service' },
              { label: 'Special Service', value: 'Special Service' }
            ]}
          />

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
              placeholder="e.g. Empowerment Sunday"
            />
          </div>

          <CustomDateTimePicker
            label="Date & Time"
            value={date}
            onChange={setDate}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] px-6 h-12 bg-[#1E67FC] hover:bg-[#0F53D6] text-white font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
