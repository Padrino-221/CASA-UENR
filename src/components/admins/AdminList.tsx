'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlass,
  Plus,
  Pencil,
  Trash
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { formatRoleLabel } from '@/lib/utils';

export default function AdminList({
  initialUsers,
  viewerRole,
}: {
  initialUsers: any[];
  viewerRole?: string | null;
}) {
  const { data: session } = useSession();
  const role = viewerRole ?? session?.user?.role;
  const isNational = role === 'NATIONAL_ADMIN';
  const isLocal = role === 'LOCAL_ADMIN';
  const canManage = isNational || isLocal;

  const roleOptions = isNational
    ? [
        { label: 'National Admin', value: 'NATIONAL_ADMIN' },
        { label: 'Regional Admin', value: 'REGIONAL_ADMIN' },
        { label: 'Local Admin', value: 'LOCAL_ADMIN' },
        { label: 'Content Manager', value: 'CONTENT_MANAGER' },
        { label: 'Finance', value: 'FINANCE' },
        { label: 'Secretary', value: 'SECRETARY' },
      ]
    : [
        { label: 'Finance', value: 'FINANCE' },
        { label: 'Secretary', value: 'SECRETARY' },
      ];

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [regions, setRegions] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: isNational ? 'REGIONAL_ADMIN' : 'FINANCE',
    regionId: '',
    chapterId: '',
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/regions');
      if (res.ok) {
        const data = await res.json();
        setRegions(data.regions || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  };

  const fetchChapters = async (regionId?: string) => {
    try {
      const url = regionId ? `/api/chapters?regionId=${regionId}` : '/api/chapters';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setChapters(data.chapters || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', role: isNational ? 'REGIONAL_ADMIN' : 'FINANCE', regionId: '', chapterId: '' });
    setTempPassword('');
    setFormError('');
    fetchRegions();
    setShowAddModal(true);
  };

  const openEditModal = async (user: any) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'REGIONAL_ADMIN',
      regionId: user.regionId || '',
      chapterId: user.chapterId || '',
    });
    setFormError('');
    await fetchRegions();
    if (user.regionId) {
      await fetchChapters(user.regionId);
    }
    setShowEditModal(true);
  };

  const validateForm = () => {
    if (!isNational) return true; // Local admins: the chapter is fixed to their own.
    if (formData.role === 'REGIONAL_ADMIN' && !formData.regionId) {
      setFormError('Please select a region for Regional Admin.');
      return false;
    }
    if (formData.role === 'LOCAL_ADMIN' || formData.role === 'FINANCE' || formData.role === 'SECRETARY') {
      if (!formData.regionId) {
        setFormError('Please select a region.');
        return false;
      }
      if (!formData.chapterId) {
        setFormError('Please select a chapter.');
        return false;
      }
    }
    return true;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setTempPassword(data.tempPassword || 'Account created');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tempPassword, mustChangePassword, notice, ...userData } = data;
        setUsers(prev => [...prev, userData]);
      }
    } catch (err) {
      console.error('Failed to create admin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userData } = data;
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...userData } : u));
        setShowEditModal(false);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Failed to update admin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: any) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error('Failed to delete admin:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 mb-6">
        <div className="relative w-full lg:w-[280px]">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" weight="duotone" />
          <input
            type="text"
            placeholder="Search admins..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canManage && (
          <button className="btn-lux-primary shrink-0" onClick={openAddModal}>
            <Plus size={18} weight="duotone" />
            <span>{isLocal ? 'Add Sub-account' : 'Add Admin'}</span>
          </button>
        )}
      </div>

      {/* Admin Table */}
      <div className="overflow-hidden border border-black/5 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-black uppercase tracking-[0.18em] text-slate-500">Name</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-[0.18em] text-slate-500">Role</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-[0.18em] text-slate-500">Email</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-[0.18em] text-slate-500">Region</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-[0.18em] text-slate-500">Chapter</th>
                <th className="px-6 py-4 text-right font-black uppercase tracking-[0.18em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-slate-100 border border-black/5 flex items-center justify-center text-slate-400">
                        <span className="text-xs font-black uppercase tracking-[0.18em]">{user.name?.charAt(0) || '?'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center border border-black/5 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                      {formatRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 truncate max-w-[200px]">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{user.region?.name || (user.role === 'NATIONAL_ADMIN' ? 'National' : 'Unassigned')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{user.chapter?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {canManage ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex h-9 w-9 items-center justify-center border border-black/5 bg-slate-50 text-slate-500 hover:bg-[#EBF2FF] hover:text-[#1E67FC] transition-all"
                        >
                          <Pencil size={16} weight="duotone" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="inline-flex h-9 w-9 items-center justify-center border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash size={16} weight="duotone" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-500">
            No administrators match your search.
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setTempPassword(''); }}
        title="Add Admin"
        description="Create a new admin account with role-based access"
      >
        {tempPassword ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 p-6 text-center">
              <h3 className="text-lg font-black text-emerald-800">Admin Created Successfully</h3>
              <p className="text-sm text-emerald-600 font-semibold mt-2">Temporary Password</p>
              <div className="mt-3 bg-white border border-emerald-200 px-4 py-3 font-mono text-lg font-black text-emerald-900 select-all">
                {tempPassword}
              </div>
              <p className="text-xs text-emerald-500 font-medium mt-3">
                Share this password securely. It will not be shown again.
              </p>
            </div>
            <button
              onClick={() => { setShowAddModal(false); setTempPassword(''); }}
              className="w-full h-12 bg-[#1E67FC] hover:bg-[#0F53D6] text-white font-black text-sm transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div>
              <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder:text-slate-400"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder:text-slate-400"
                placeholder="admin@example.com"
              />
            </div>
            <CustomDropdown
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
            />
            {isNational && formData.role === 'REGIONAL_ADMIN' && (
              <CustomDropdown
                label="Region"
                placeholder="Select region..."
                options={[{ label: 'Select region...', value: '' }, ...regions.map((r: any) => ({ label: r.name, value: r.id }))]}
                value={formData.regionId}
                onChange={(val) => { setFormData({ ...formData, regionId: val, chapterId: '' }); fetchChapters(val); }}
              />
            )}
            {isNational && (formData.role === 'LOCAL_ADMIN' || formData.role === 'FINANCE' || formData.role === 'SECRETARY') && (
              <>
                <CustomDropdown
                  label="Region"
                  placeholder="Select region..."
                  options={[{ label: 'Select region...', value: '' }, ...regions.map((r: any) => ({ label: r.name, value: r.id }))]}
                  value={formData.regionId}
                  onChange={(val) => { setFormData({ ...formData, regionId: val, chapterId: '' }); fetchChapters(val); }}
                />
                <CustomDropdown
                  label="Chapter"
                  placeholder="Select chapter..."
                  options={[{ label: 'Select chapter...', value: '' }, ...chapters.map((c: any) => ({ label: c.name, value: c.id }))]}
                  value={formData.chapterId}
                  onChange={(val) => setFormData({ ...formData, chapterId: val })}
                />
              </>
            )}
            {formError && (
              <div className="bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-xs font-bold text-red-600">{formError}</p>
              </div>
            )}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button type="button" className="px-6 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-black text-sm transition-all" onClick={() => { setShowAddModal(false); setTempPassword(''); }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] text-white px-8 h-12 font-black text-sm transition-all disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setCurrentUser(null); }}
        title="Edit Admin"
        description="Update admin account details and role"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A]"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A]"
            />
          </div>
          <CustomDropdown
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(val) => setFormData({ ...formData, role: val })}
          />
          {isNational && formData.role === 'REGIONAL_ADMIN' && (
            <CustomDropdown
              label="Region"
              placeholder="Select region..."
              options={[{ label: 'Select region...', value: '' }, ...regions.map((r: any) => ({ label: r.name, value: r.id }))]}
              value={formData.regionId}
              onChange={(val) => { setFormData({ ...formData, regionId: val, chapterId: '' }); fetchChapters(val); }}
            />
          )}
          {isNational && (formData.role === 'LOCAL_ADMIN' || formData.role === 'FINANCE' || formData.role === 'SECRETARY') && (
            <>
              <CustomDropdown
                label="Region"
                placeholder="Select region..."
                options={[{ label: 'Select region...', value: '' }, ...regions.map((r: any) => ({ label: r.name, value: r.id }))]}
                value={formData.regionId}
                onChange={(val) => { setFormData({ ...formData, regionId: val, chapterId: '' }); fetchChapters(val); }}
              />
              <CustomDropdown
                label="Chapter"
                placeholder="Select chapter..."
                options={[{ label: 'Select chapter...', value: '' }, ...chapters.map((c: any) => ({ label: c.name, value: c.id }))]}
                value={formData.chapterId}
                onChange={(val) => setFormData({ ...formData, chapterId: val })}
              />
            </>
          )}
          {formError && (
            <div className="bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-xs font-bold text-red-600">{formError}</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button type="button" className="px-6 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-black text-sm transition-all" onClick={() => { setShowEditModal(false); setCurrentUser(null); }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] text-white px-8 h-12 font-black text-sm transition-all disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Admin"
        description="This action cannot be undone"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 p-5 text-center">
            <p className="text-sm font-bold text-red-700">
              Are you sure you want to delete <span className="text-red-900">{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs text-red-500 font-semibold mt-2">
              This will permanently remove their access to the system.
            </p>
          </div>
          <div className="flex items-center justify-end gap-4">
            <button type="button" className="px-6 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-black text-sm transition-all" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteTarget)} className="bg-red-500 hover:bg-red-600 text-white px-8 h-12 font-black text-sm transition-all">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
