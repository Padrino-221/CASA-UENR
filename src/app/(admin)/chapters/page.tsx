'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { TableAreaSkeleton, HeaderSkeleton } from '@/components/ui/Skeleton';
import {
  MagnifyingGlass,
  Plus,
  FileArrowUp
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useChapters } from '@/hooks/useChapters';
import { useRegions } from '@/hooks/useRegions';
import { ChapterTable } from '@/components/chapters/ChapterTable';
import { ChapterAddModal } from '@/components/chapters/ChapterAddModal';
import { ChapterEditModal } from '@/components/chapters/ChapterEditModal';
import { ChapterBulkModal } from '@/components/chapters/ChapterBulkModal';
import { Chapter } from '@/types/models';
import { useGlobalSearch } from '@/context/SearchContext';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function ChaptersPage() {
  return (
    <Suspense fallback={<ChaptersLoadingSkeleton />}>
      <ChaptersPageContent />
    </Suspense>
  );
}

function ChaptersPageContent() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { chapters, loading, isSubmitting, cutoffDate, createChapter, updateChapter, deleteChapter, bulkUploadChapters } = useChapters();
  const { regions } = useRegions();

  const { searchQuery } = useGlobalSearch();
  const searchParams = useSearchParams();
  const urlRegionId = searchParams.get('regionId') || '';

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState(urlRegionId);

  useEffect(() => {
    setSelectedRegionId(urlRegionId);
  }, [urlRegionId]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const isNational = role === 'NATIONAL_ADMIN';

  const [editingCh, setEditingCh] = useState<Chapter | null>(null);
  const [newCh, setNewCh] = useState({
    name: '', university: 'University', regionId: '', adminName: '', adminEmail: '', adminPassword: ''
  });
  const [editAdmin, setEditAdmin] = useState({ id: '', name: '', email: '', password: '' });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [targetRegionId, setTargetRegionId] = useState('');

  const handleEditInit = (ch: Chapter) => {
    setEditingCh(ch);
    if (ch.admins?.[0]) {
      setEditAdmin({ id: ch.admins[0].id, name: ch.admins[0].name, email: ch.admins[0].email, password: '' });
    } else {
      setEditAdmin({ id: '', name: '', email: '', password: '' });
    }
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await createChapter(newCh)) {
      setShowAddModal(false);
      setNewCh({ name: '', university: 'University', regionId: '', adminName: '', adminEmail: '', adminPassword: '' });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCh) return;
    const payload = {
      name: editingCh.name, type: editingCh.university, regionId: editingCh.regionId,
      adminId: editAdmin.id, adminName: editAdmin.name, adminEmail: editAdmin.email,
      adminPassword: editAdmin.password || undefined
    };
    if (await updateChapter(editingCh.id, payload)) {
      setShowEditModal(false);
      setEditingCh(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;
    if (await bulkUploadChapters(bulkFile, targetRegionId)) {
      setShowBulkModal(false);
      setBulkFile(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "chapterName,chapterType,adminName,adminEmail,adminPassword\nLegon Campus,University,Kofi Amoah,kofi@legon.org,LegonPass123\nKnust Branch,University,Ama Serwaa,ama@knust.org,KnustPass456";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chapter_onboarding_template.csv';
    a.click();
  };

  const filteredChapters = chapters.filter(ch => {
    const activeQuery = localSearchQuery || searchQuery;
    const matchesRegion = !selectedRegionId || ch.regionId === selectedRegionId;
    return matchesRegion && (
      ch.name.toLowerCase().includes(activeQuery.toLowerCase()) ||
      ch.university.toLowerCase().includes(activeQuery.toLowerCase())
    );
  });

  const selectedRegion = regions.find(r => r.id === selectedRegionId);

  const regionDropdownOptions = [
    { label: 'All Regions', value: '' },
    ...regions.map((reg) => ({ label: reg.name, value: reg.id }))
  ];

  if (loading && chapters.length === 0) {
    return <ChaptersLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Chapters</h1>
              {selectedRegion && (
                <div className="bg-[#EBF2FF] text-[#1E67FC] text-[10px] font-black px-3 py-1.5 flex items-center gap-2 shrink-0 border border-[#1E67FC]/10 mt-2 md:mt-0 w-fit">
                  <span>Region: {selectedRegion.name}</span>
                  <Link href="/chapters" className="hover:text-[#0F53D6] text-slate-400 font-extrabold text-xs leading-none">×</Link>
                </div>
              )}
            </div>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Manage chapters</p>
          </div>

          <div className="actions-cluster">
            {(role === 'REGIONAL_ADMIN' || isNational) && (
              <>
                <button className="btn-glass-alt" onClick={() => setShowBulkModal(true)}><FileArrowUp size={18} weight="duotone" /><span>Bulk Import</span></button>
                <button className="btn-lux-primary" onClick={() => setShowAddModal(true)}><Plus size={18} weight="duotone" /><span>Add Chapter</span></button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 mb-6">
        <div className="relative w-full sm:w-[320px]">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" weight="duotone" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isNational && (
            <CustomDropdown
              options={regionDropdownOptions}
              value={selectedRegionId}
              onChange={(val) => setSelectedRegionId(val)}
              placeholder="All Regions"
              className="w-full md:w-[180px] !space-y-0"
            />
          )}

          {(localSearchQuery || selectedRegionId) && (
            <button
              onClick={() => {
                setLocalSearchQuery('');
                setSelectedRegionId('');
              }}
              className="px-4 py-2.5 text-slate-400 hover:text-[#1E67FC] hover:bg-[#1E67FC]/10 font-black text-xs uppercase tracking-widest transition-all shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <ChapterTable
        chapters={filteredChapters}
        role={role}
        onEdit={handleEditInit}
        onDelete={deleteChapter}
        searchQuery={localSearchQuery || searchQuery}
        cutoffDate={cutoffDate}
        isNational={isNational}
      />

      <ChapterAddModal
        isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleCreateSubmit}
        newCh={newCh} setNewCh={setNewCh} regions={regions} isSubmitting={isSubmitting}
        isNational={isNational}
      />

      <ChapterEditModal
        isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleUpdateSubmit}
        editingCh={editingCh} setEditingCh={setEditingCh}
        editAdmin={editAdmin} setEditAdmin={setEditAdmin}
        regions={regions} isSubmitting={isSubmitting}
        isNational={isNational}
      />

      <ChapterBulkModal
        isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onSubmit={handleBulkSubmit}
        bulkFile={bulkFile} setBulkFile={setBulkFile} onDownloadTemplate={downloadTemplate}
        regions={regions} targetRegionId={targetRegionId} setTargetRegionId={setTargetRegionId}
        isSubmitting={isSubmitting}
        role={role}
      />
    </div>
  );
}

function ChaptersLoadingSkeleton() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <TableAreaSkeleton />
    </div>
  );
}
