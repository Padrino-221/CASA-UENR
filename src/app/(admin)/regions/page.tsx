'use client';

import React, { useState } from 'react';
import { TableAreaSkeleton, HeaderSkeleton } from '@/components/ui/Skeleton';
import {
  Plus,
  FileArrowUp
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import { useRegions } from '@/hooks/useRegions';
import { RegionTable } from '@/components/regions/RegionTable';
import { RegionAddModal } from '@/components/regions/RegionAddModal';
import { RegionEditModal } from '@/components/regions/RegionEditModal';
import { RegionBulkModal } from '@/components/regions/RegionBulkModal';
import { Region } from '@/types/models';

export default function RegionsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const { regions, loading, isSubmitting, createRegion, updateRegion, deleteRegion, bulkUploadRegions } = useRegions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [newRegion, setNewRegion] = useState({ 
    name: '', adminName: '', adminEmail: '', adminPassword: ''
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await createRegion(newRegion)) {
      setShowAddModal(false);
      setNewRegion({ name: '', adminName: '', adminEmail: '', adminPassword: '' });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegion) return;
    if (await updateRegion(editingRegion.id, { name: editingRegion.name })) {
      setShowEditModal(false);
      setEditingRegion(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;
    if (await bulkUploadRegions(bulkFile)) {
      setShowBulkModal(false);
      setBulkFile(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "regionName,adminName,adminEmail,adminPassword\nAshanti Region,Samuel Mensah,samuel@ashanti.org,InitialPass123\nNorthern Region,Iddrisu Baako,id@northern.org,SecurePass456";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'region_onboarding_template.csv';
    a.click();
  };

  if (loading && regions.length === 0) {
    return <RegionsLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Regions</h1>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Manage regions</p>
          </div>
 
          {userRole === 'NATIONAL_ADMIN' && (
            <div className="actions-cluster">
              <button className="btn-glass-alt" onClick={() => setShowBulkModal(true)}><FileArrowUp size={18} weight="duotone" /><span>Bulk Import</span></button>
              <button className="btn-lux-primary" onClick={() => setShowAddModal(true)}><Plus size={18} weight="duotone" /><span>Add Region</span></button>
            </div>
          )}
        </div>
      </header>
 
      <RegionTable 
        regions={regions} 
        userRole={userRole} 
        onEdit={(r) => { setEditingRegion(r); setShowEditModal(true); }} 
        onDelete={deleteRegion} 
      />

      <RegionAddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleCreateSubmit} newRegion={newRegion} setNewRegion={setNewRegion} isSubmitting={isSubmitting} />
      
      <RegionEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleUpdateSubmit} editingRegion={editingRegion} setEditingRegion={setEditingRegion} isSubmitting={isSubmitting} />

      <RegionBulkModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onSubmit={handleBulkSubmit} bulkFile={bulkFile} setBulkFile={setBulkFile} onDownloadTemplate={downloadTemplate} isSubmitting={isSubmitting} />
    </div>
  );
}

function RegionsLoadingSkeleton() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <TableAreaSkeleton />
    </div>
  );
}
