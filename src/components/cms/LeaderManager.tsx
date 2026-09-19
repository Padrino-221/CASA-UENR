'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import MediaPicker from './MediaPicker';
import { useNotification } from '@/context/NotificationContext';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';

const COLOR_OPTIONS = ['brand', 'lime', 'violet', 'teal'].map((color) => ({
  label: color,
  value: color,
}));

interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
  imageUrl: string | null;
  published: boolean;
  order: number;
}

const EMPTY = {
  name: '',
  role: '',
  bio: '',
  initials: '',
  color: 'brand',
  imageUrl: '',
  published: true,
  order: 0,
};

const inputCls =
  'w-full min-h-[44px] px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:border-primary focus:outline-none';

export default function LeaderManager() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');
  const { confirm } = useNotification();

  const load = useCallback(async () => {
    const res = await fetch('/api/content/leaders');
    if (res.ok) setLeaders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError('');
    setOpen(true);
  };

  const openEdit = (leader: Leader) => {
    setEditingId(leader.id);
    setForm({
      name: leader.name,
      role: leader.role,
      bio: leader.bio,
      initials: leader.initials,
      color: leader.color,
      imageUrl: leader.imageUrl ?? '',
      published: leader.published,
      order: leader.order,
    });
    setError('');
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(editingId ? `/api/content/leaders/${editingId}` : '/api/content/leaders', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save leader');
    }
  };

  const remove = (leader: Leader) => {
    confirm({
      title: 'Delete leader',
      message: `"${leader.name}" will be permanently removed. This cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await fetch(`/api/content/leaders/${leader.id}`, { method: 'DELETE' });
        load();
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Leaders</h1>
          <p className="text-sm text-[#64748B] font-medium mt-1">
            These appear in the leadership carousel on the About page.
          </p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 bg-primary text-white text-[12px] font-bold flex items-center gap-2">
          <Plus size={15} weight="bold" />
          Add leader
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#94A3B8] font-medium">Loading…</p>
      ) : leaders.length === 0 ? (
        <p className="text-sm text-[#94A3B8] font-medium border border-dashed border-[#CBD5E1] p-10 text-center">
          No leaders yet. Add your first one.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaders.map((leader) => (
            <div key={leader.id} className="border border-[#E2E8F0] bg-white flex gap-4 p-4">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-[#EFF6FF] flex items-center justify-center">
                {leader.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={leader.imageUrl} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-black text-[16px]">{leader.initials || '—'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight truncate">{leader.name}</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-primary mt-0.5 truncate">{leader.role}</p>
                <p className="text-[12px] text-[#64748B] font-medium mt-1 line-clamp-2">{leader.bio}</p>
                {!leader.published && (
                  <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">Draft</span>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => openEdit(leader)} className="p-2 text-[#64748B] hover:text-primary" aria-label="Edit">
                  <PencilSimple size={16} weight="bold" />
                </button>
                <button onClick={() => remove(leader)} className="p-2 text-[#DC2626]" aria-label="Delete">
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editingId ? 'Edit leader' : 'Add leader'} maxWidth="max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm font-bold text-[#DC2626]">{error}</p>}
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Photo</label>
            <MediaPicker value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Role</label>
              <input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="President" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Bio</label>
            <textarea className={inputCls} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Initials</label>
              <input className={inputCls} value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} placeholder="OA" />
            </div>
            <CustomDropdown
              label="Colour"
              options={COLOR_OPTIONS}
              value={form.color}
              onChange={(value) => setForm({ ...form, color: value })}
            />
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Order</label>
              <input type="number" className={inputCls} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
            <span className="text-[13px] font-bold text-[#0F172A]">Published</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-5 text-[12px] font-bold text-[#64748B]">
              Cancel
            </button>
            <button type="submit" className="h-11 px-6 bg-primary text-white text-[12px] font-bold">
              {editingId ? 'Save changes' : 'Add leader'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
