'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useNotification } from '@/context/NotificationContext';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';

interface SiteEvent {
  id: string;
  month: string;
  day: string;
  kind: string;
  title: string;
  text: string;
  meta: string | null;
  published: boolean;
  order: number;
}

const EMPTY = { month: '', day: '', kind: 'Event', title: '', text: '', meta: '', published: true, order: 0 };

const inputCls =
  'w-full min-h-[44px] px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:border-primary focus:outline-none';

export default function EventManager() {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');
  const { confirm } = useNotification();

  const load = useCallback(async () => {
    const res = await fetch('/api/content/events');
    if (res.ok) setEvents(await res.json());
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

  const openEdit = (event: SiteEvent) => {
    setEditingId(event.id);
    setForm({
      month: event.month,
      day: event.day,
      kind: event.kind,
      title: event.title,
      text: event.text,
      meta: event.meta ?? '',
      published: event.published,
      order: event.order,
    });
    setError('');
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(editingId ? `/api/content/events/${editingId}` : '/api/content/events', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save event');
    }
  };

  const remove = (event: SiteEvent) => {
    confirm({
      title: 'Delete event',
      message: `"${event.title}" will be permanently removed.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await fetch(`/api/content/events/${event.id}`, { method: 'DELETE' });
        load();
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Upcoming Events</h1>
          <p className="text-sm text-[#64748B] font-medium mt-1">These appear on the News &amp; Events page.</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 bg-primary text-white text-[12px] font-bold flex items-center gap-2">
          <Plus size={15} weight="bold" />
          New event
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#94A3B8] font-medium">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-[#94A3B8] font-medium border border-dashed border-[#CBD5E1] p-10 text-center">
          No events yet.
        </p>
      ) : (
        <div className="border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0]">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-primary text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-black uppercase">{event.month}</span>
                <span className="text-[15px] font-black leading-none">{event.day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">{event.kind}</span>
                <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight truncate">{event.title}</h3>
                <p className="text-[12px] text-[#64748B] font-medium truncate">{event.meta}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(event)} className="p-2 text-[#64748B] hover:text-primary" aria-label="Edit">
                  <PencilSimple size={16} weight="bold" />
                </button>
                <button onClick={() => remove(event)} className="p-2 text-[#DC2626]" aria-label="Delete">
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editingId ? 'Edit event' : 'New event'} maxWidth="max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm font-bold text-[#DC2626]">{error}</p>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Month</label>
              <input className={inputCls} value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="Oct" />
            </div>
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Day</label>
              <input className={inputCls} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} placeholder="16" />
            </div>
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Kind</label>
              <input className={inputCls} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} placeholder="Retreat" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Title</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Description</label>
            <textarea className={inputCls} rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Meta</label>
            <input className={inputCls} value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Main Auditorium · 6:00 PM" />
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
              {editingId ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
