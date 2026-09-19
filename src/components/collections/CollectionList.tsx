'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  MagnifyingGlass,
  DownloadSimple,
  FileArrowUp
} from '@phosphor-icons/react';

import { useSearchParams } from 'next/navigation';
import { useCollections } from '@/hooks/useCollections';
import { CollectionStats } from './CollectionStats';
import { CollectionTable } from './CollectionTable';
import { CollectionAddModal } from './CollectionAddModal';
import { CollectionEditModal } from './CollectionEditModal';
import { CollectionBulkModal } from './CollectionBulkModal';
import { Transaction } from '@/types/models';
import { useGlobalSearch } from '@/context/SearchContext';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useNotification } from '@/context/NotificationContext';
import { isLocalScope } from '@/lib/roles';

interface CollectionListProps {
  initialCollections: Transaction[];
  chapters: { id: string; name: string }[];
  members: { id: string; name: string; studentId?: string }[];
  role: string | null;
}

export default function CollectionList({ initialCollections, chapters, members, role }: CollectionListProps) {
  const { isSubmitting, createCollection, updateCollection, deleteCollection, bulkUploadCollections } = useCollections();
  const notification = useNotification();
  
  const searchParams = useSearchParams();
  const urlChId = searchParams.get('chapterId') || '';

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedChId, setSelectedChId] = useState(urlChId);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    setSelectedChId(urlChId);
  }, [urlChId]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingCol, setEditingCol] = useState<Transaction | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const { searchQuery } = useGlobalSearch();

  const [newCol, setNewCol] = useState({ 
    amount: '', type: 'INCOME', category: 'Offering', chapterId: '', studentId: '', 
    date: new Date().toISOString().split('T')[0], description: ''
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await createCollection(newCol)) {
      setShowAddModal(false);
      setNewCol({ 
        amount: '', type: 'INCOME', category: 'Offering', chapterId: '', studentId: '', 
        date: new Date().toISOString().split('T')[0], description: '' 
      });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol) return;
    if (await updateCollection(editingCol.id, { amount: editingCol.amount, category: editingCol.category, date: editingCol.date })) {
      setShowEditModal(false);
      setEditingCol(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFile && await bulkUploadCollections(bulkFile)) {
      setShowBulkModal(false);
      setBulkFile(null);
    }
  };

  const downloadTemplate = () => {
    const headers = "amount,type,category,date,studentId,description\n";
    const example1 = "150.00,INCOME,Tithe,2026-04-17,UEB3227523,April Member Contribution\n";
    const csvContent = headers + example1;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'u-chms_financial_import.csv';
    a.click();
  };

  // Extract unique active categories dynamically from initial collections
  const uniqueCategories = Array.from(
    new Set(initialCollections.map((c) => c.category))
  );

  // Dual/Triple Multi-Filter execution
  const filteredCollections = initialCollections.filter(col => {
    if (selectedChId && col.chapterId !== selectedChId) {
      return false;
    }
    // 2. Filter by Selected Financial Category
    if (selectedCategory && col.category !== selectedCategory) {
      return false;
    }
    // 3. Filter by Input Search Queries
    const activeQuery = (localSearchQuery || searchQuery).toLowerCase();
    return (
      col.category.toLowerCase().includes(activeQuery) ||
      (col.chapter?.name ?? '').toLowerCase().includes(activeQuery) ||
      (col.student?.name || 'Institutional').toLowerCase().includes(activeQuery) ||
      col.amount.toString().includes(activeQuery)
    );
  });

  // Calculate live dynamic balance metrics based strictly on filtered subset!
  const totalIncome = filteredCollections.filter(c => c.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredCollections.filter(c => c.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chapterDropdownOptions = [
    { label: 'All Chapters', value: '' },
    ...chapters.map(ch => ({ label: ch.name, value: ch.id }))
  ];

  const categoryDropdownOptions = [
    { label: 'All Categories', value: '' },
    ...uniqueCategories.map(cat => ({
      label: cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      value: cat
    }))
  ];

  const handleExportReport = async () => {
    try {
      const res = await fetch(`/api/reports/export?type=collections&chapterId=${selectedChId}&category=${selectedCategory}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'collection-report.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notification.success('Report downloaded.');
    } catch {
      notification.error('Failed to download report.');
    }
  };

  const selectedChapter = chapters.find(ch => ch.id === selectedChId);
  const selectedCategoryLabel = selectedCategory ? selectedCategory.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';

  return (
    <>
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Collections</h1>
              {selectedChapter && (
                <div className="bg-[#EBF2FF] text-[#1E67FC] text-[10px] font-black px-3 py-1.5 flex items-center gap-2 shrink-0 border border-[#1E67FC]/10 mt-2 md:mt-0 w-fit">
                  <span>Chapter: {selectedChapter.name}</span>
                  <button 
                    onClick={() => setSelectedChId('')}
                    className="hover:text-[#0F53D6] text-slate-400 font-extrabold text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="bg-[#EBF2FF] text-[#1E67FC] text-[10px] font-black px-3 py-1.5 flex items-center gap-2 shrink-0 border border-[#1E67FC]/10 mt-2 md:mt-0 w-fit">
                  <span>Type: {selectedCategoryLabel}</span>
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="hover:text-[#0F53D6] text-slate-400 font-extrabold text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Finance</p>
          </div>

          <div className="actions-cluster">
            <button className="btn-glass-alt" onClick={handleExportReport}><DownloadSimple size={18} weight="duotone" /><span>Export Report</span></button>
            {isLocalScope(role) && (
              <>
                <button className="btn-glass-alt" onClick={() => setShowBulkModal(true)}><FileArrowUp size={18} weight="duotone" /><span>Bulk Import</span></button>
                <button className="btn-lux-primary" onClick={() => setShowAddModal(true)}><Plus size={18} weight="duotone" /><span>Add Collection</span></button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Recalibrating Live Balance stats sheet */}
      <CollectionStats totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

      {/* Premium Multi-Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 mb-6">
        {/* Search Field */}
        <div className="relative w-full md:w-[320px]">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" weight="duotone" />
          <input 
            type="text" 
            placeholder="Search transactions, members, amount..." 
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
          />
        </div>

        {/* Dynamic Dropdowns Filter Cluster */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
          {!isLocalScope(role) && (
            <CustomDropdown 
              options={chapterDropdownOptions}
              value={selectedChId}
              onChange={(val) => setSelectedChId(val)}
              placeholder="All Chapters"
              className="w-full sm:w-[220px] !space-y-0"
            />
          )}

          {/* Category Dropdown Selector */}
          <CustomDropdown 
            options={categoryDropdownOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            placeholder="All Categories"
            className="w-full sm:w-[180px] !space-y-0"
          />

          {(localSearchQuery || selectedChId || selectedCategory) && (
            <button 
              onClick={() => {
                setLocalSearchQuery('');
                setSelectedChId('');
                setSelectedCategory('');
              }}
              className="px-4 py-2.5 text-slate-400 hover:text-[#1E67FC] hover:bg-[#1E67FC]/10 font-black text-xs uppercase tracking-widest transition-all shrink-0 w-full sm:w-auto"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <CollectionTable 
        collections={filteredCollections} role={role} 
        onEdit={(col) => { setEditingCol(col); setShowEditModal(true); }}
        onDelete={deleteCollection} searchQuery={searchQuery}
        onAddClick={() => setShowAddModal(true)}
      />

      <CollectionAddModal 
        isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleCreateSubmit}
        newCol={newCol} setNewCol={setNewCol} institutions={chapters} members={members} isSubmitting={isSubmitting}
      />

      <CollectionEditModal 
        isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleUpdateSubmit}
        editingCol={editingCol} setEditingCol={setEditingCol} isSubmitting={isSubmitting}
      />

      <CollectionBulkModal 
        isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onSubmit={handleBulkSubmit}
        bulkFile={bulkFile} setBulkFile={setBulkFile} onDownloadTemplate={downloadTemplate} isSubmitting={isSubmitting}
      />
    </>
  );
}
