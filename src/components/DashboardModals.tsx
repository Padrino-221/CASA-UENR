'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';

interface Region {
  id: string;
  name: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'transaction' | 'chapter' | 'admin' | null;
}

const DashboardModals = ({ isOpen, onClose, type }: ModalProps) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [mounted, setMounted] = useState(false);

  const fetchRegions = React.useCallback(async () => {
    try {
      const res = await fetch('/api/regions');
      const data = await res.json();
      setRegions(data);
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
      if (isOpen && (type === 'chapter' || type === 'admin')) {
        fetchRegions();
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [isOpen, type, fetchRegions]);

  if (!mounted || !isOpen || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'transaction':
        return <TransactionForm onClose={onClose} />;
      case 'chapter':
        return <ChapterForm onClose={onClose} regions={regions} />;
      case 'admin':
        return <AdminForm onClose={onClose} regions={regions} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'transaction': return 'New Collection';
      case 'chapter': return 'Add Chapter';
      case 'admin': return 'Add Admin';
      default: return '';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getTitle()} 
    >
      {renderContent()}
    </Modal>
  );
};

const inputClass = "w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400";
const labelClass = "text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1";
const btnPrimaryClass = "bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all";
const btnSecondaryClass = "px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all";

const TransactionForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({ amount: '', category: 'Offering', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const notification = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: formData.amount,
          category: formData.category,
          date: formData.date
        })
      });
      if (!res.ok) throw new Error('API Sync Failed');
      notification.success('Transaction synchronized with ledger.');
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      notification.error('Transaction failed to sync');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Amount (GHS)</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₵</div>
            <input 
              type="number" 
              placeholder="0.00" 
              required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              autoFocus 
              className={`${inputClass} pl-9 text-base font-bold`}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomDropdown 
              label="Category"
              value={formData.category}
              onChange={val => setFormData({...formData, category: val})}
              options={[
                { label: 'Offering', value: 'Offering' },
                { label: 'Tithe', value: 'Tithe' },
                { label: 'Building Fund', value: 'Building Fund' },
                { label: 'Special Appeal', value: 'Special Appeal' }
              ]}
            />
          </div>
          <div className="flex flex-col justify-end">
            <CustomDateTimePicker 
              label="Date & Time"
              value={new Date(formData.date)}
              onChange={val => setFormData({...formData, date: val.toISOString().split('T')[0]})}
              popoverDirection="left"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
        <button type="button" onClick={onClose} className={btnSecondaryClass}>Cancel</button>
        <button type="submit" disabled={loading} className={btnPrimaryClass}>{loading ? 'Syncing...' : 'Record Transaction'}</button>
      </div>
    </form>
  )
};

const ChapterForm = ({ onClose, regions }: { onClose: () => void, regions: Region[] }) => {
  const [formData, setFormData] = useState({ name: '', regionId: '', type: 'University' });
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      notification.success('Chapter added.');
      onClose();
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Chapter Name</label>
          <input type="text" placeholder="e.g. University of Ghana" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className={inputClass} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomDropdown 
              label="Region"
              value={formData.regionId}
              onChange={val => setFormData({...formData, regionId: val})}
              placeholder="Select a region..."
              options={regions.map(r => ({ label: r.name, value: r.id }))}
            />
          </div>
          <div>
            <CustomDropdown 
              label="Type"
              value={formData.type}
              onChange={val => setFormData({...formData, type: val})}
              options={[
                { label: 'University', value: 'University' },
                { label: 'Polytechnic', value: 'Polytechnic' },
                { label: 'College', value: 'College' },
                { label: 'Secondary', value: 'Secondary' }
              ]}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
        <button type="button" onClick={onClose} className={btnSecondaryClass}>Cancel</button>
        <button type="submit" disabled={loading} className={btnPrimaryClass}>{loading ? 'Saving...' : 'Add Chapter'}</button>
      </div>
    </form>
  );
};

const AdminForm = ({ onClose, regions }: { onClose: () => void, regions: Region[] }) => {
  const [formData, setFormData] = useState({ name: '', email: '', regionId: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const notification = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('API Sync Failed');
      notification.success('Admin account created.');
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      notification.error('Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input required type="text" placeholder="Rev. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input required type="email" placeholder="admin@u-chms.org" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
        </div>
        <div>
          <CustomDropdown 
            label="Assign Region"
            value={formData.regionId}
            onChange={val => setFormData({...formData, regionId: val})}
            placeholder="Select region..."
            options={regions.map(r => ({ label: r.name, value: r.id }))}
          />
        </div>
      </div>
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 mt-6">
        <button type="button" onClick={onClose} className={btnSecondaryClass}>Cancel</button>
        <button type="submit" disabled={loading} className={btnPrimaryClass}>{loading ? 'Saving...' : 'Create Admin'}</button>
      </div>
    </form>
  );
};

export default DashboardModals;
