'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Plus,
  Building,
  Globe,
  Tag,
  TrendUp,
  ShieldWarning,
  Pencil,
  Trash
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';
import { isLocalScope } from '@/lib/roles';

export default function EventsPage() {
  const { data: session } = useSession();
  const notification = useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date();
    end.setHours(end.getHours() + 2);
    return end;
  });
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('Fellowship');

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [editEndDate, setEditEndDate] = useState<Date>(new Date());
  const [editVenue, setEditVenue] = useState('');
  const [editCategory, setEditCategory] = useState('Fellowship');

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch {
      notification.error('Failed to sync events.');
    } finally {
      setLoading(false);
    }
  };

  const canManageEvent = (eventItem: { regionId?: string; chapterId?: string }) => {
    if (!session?.user) return false;
    const role = session.user.role;
    if (role === 'NATIONAL_ADMIN') return true;
    if (role === 'REGIONAL_ADMIN' && eventItem.regionId === session.user.regionId) return true;
    if (isLocalScope(role) && eventItem.chapterId === session.user.chapterId) return true;
    return false;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endDate && date && endDate.getTime() < date.getTime()) {
      notification.error('End date cannot be earlier than start date.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date, endDate, venue, category })
      });
      if (res.ok) {
        notification.success('Event broadcasted successfully.');
        setIsModalOpen(false);
        fetchEvents();
        setTitle('');
        setDescription('');
        setVenue('');
        setDate(new Date());
        const newEnd = new Date();
        newEnd.setHours(newEnd.getHours() + 2);
        setEndDate(newEnd);
      } else {
        notification.error('Failed to broadcast event.');
      }
    } catch {
      notification.error('Communication failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (eventItem: { id: string; title?: string; description?: string; date: string; endDate?: string; venue?: string; category?: string }) => {
    setEditEventId(eventItem.id);
    setEditTitle(eventItem.title || '');
    setEditDescription(eventItem.description || '');
    setEditDate(new Date(eventItem.date));
    setEditEndDate(eventItem.endDate ? new Date(eventItem.endDate) : new Date(eventItem.date));
    setEditVenue(eventItem.venue || '');
    setEditCategory(eventItem.category || 'Fellowship');
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventId) return;
    if (editEndDate && editDate && editEndDate.getTime() < editDate.getTime()) {
      notification.error('End date cannot be earlier than start date.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${editEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          date: editDate,
          endDate: editEndDate,
          venue: editVenue,
          category: editCategory
        })
      });
      if (res.ok) {
        notification.success('Event details updated.');
        setIsEditModalOpen(false);
        fetchEvents();
      } else {
        notification.error('Failed to update event.');
      }
    } catch {
      notification.error('Communication failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    notification.confirm({
      title: 'Delete event',
      message: 'Are you sure you want to remove this event from the mission calendar? This cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            notification.success('Event deleted successfully.');
            fetchEvents();
          } else {
            notification.error('Failed to delete event.');
          }
        } catch {
          notification.error('Communication failure.');
        }
      },
    });
  };

  const formatEventRange = (startStr: string, endStr?: string) => {
    const start = new Date(startStr);
    const optionsDate: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    
    const startDatePart = start.toLocaleDateString(undefined, optionsDate);
    const startTimePart = start.toLocaleTimeString([], optionsTime);
    
    if (!endStr) {
      return `${startDatePart} @ ${startTimePart}`;
    }
    
    const end = new Date(endStr);
    const endDatePart = end.toLocaleDateString(undefined, optionsDate);
    const endTimePart = end.toLocaleTimeString([], optionsTime);
    
    if (startDatePart === endDatePart) {
      return `${startDatePart} @ ${startTimePart} — ${endTimePart}`;
    }
    
    return `${startDatePart} @ ${startTimePart} — ${endDatePart} @ ${endTimePart}`;
  };

  if (loading && events.length === 0) {
    return (
      <div className="space-y-8 w-full animate-pulse">
        <header className="premium-header !mb-0 !pb-6">
          <div className="header-content-root">
            <div className="space-y-3">
              <div className="w-56 h-10 bg-slate-100" />
              <div className="w-32 h-4 bg-slate-550" />
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 w-full bg-slate-50/20 border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const scopeColors: Record<string, string> = {
    'NATIONAL': 'bg-rose-50 text-rose-600 border-rose-100/50',
    'REGIONAL': 'bg-amber-50 text-amber-600 border-amber-100/50',
    'LOCAL': 'bg-[#EBF2FF] text-[#1E67FC] border-[#1E67FC]/10'
  };

  const scopeIcons: Record<string, React.ReactNode> = {
    'NATIONAL': <Globe size={11} weight="duotone" />,
    'REGIONAL': <TrendUp size={11} weight="duotone" />,
    'LOCAL': <Building size={11} weight="duotone" />
  };
 
  return (
    <div className="space-y-8 w-full">
      {/* Page Header */}
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">
              Ministry Programs
            </h1>
          </div>
 
          <div className="actions-cluster">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-lux-primary"
            >
              <Plus size={20} weight="duotone" />
              <span>Broadcast Event</span>
            </button>
          </div>
        </div>
      </header>
 
      {/* Events Listing Matrix */}
      <div className="space-y-6">
        {events.map((eventItem) => (
          <div 
            key={eventItem.id} 
            className="group bg-white border border-black/5 sm: p-4 sm:p-6 lg:p-8 hover:border-[#1E67FC]/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-8 relative"
          >
            {/* Left Side: Identity & Date (Flex-1.5) */}
            <div className="flex-1 lg:flex-[1.5] flex items-start gap-4 sm:gap-6 min-w-0 w-full">
              {/* Calendar Date Block */}
              <div className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 bg-[#EBF2FF] text-[#1E67FC] sm: flex flex-col items-center justify-center border border-black/5 shrink-0 group-hover:bg-[#1E67FC] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-80 mt-0.5">
                  {new Date(eventItem.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-lg sm:text-2xl font-black tracking-tighter leading-none mb-0.5 mt-0.5">
                  {new Date(eventItem.date).getDate()}
                </span>
              </div>
 
              {/* Title & Description */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${scopeColors[eventItem.scope]}`}>
                    {scopeIcons[eventItem.scope]}
                    {eventItem.scope}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-50 text-slate-550 border border-black/5 text-[8px] font-black uppercase tracking-widest">
                    <Tag size={9} className="text-[#1E67FC]" weight="duotone" />
                    {eventItem.category}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#0F172A] group-hover:text-[#1E67FC] transition-colors leading-snug tracking-tight truncate">
                  {eventItem.title}
                </h3>
                {eventItem.description && (
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-2">
                    {eventItem.description}
                  </p>
                )}
              </div>
            </div>
 
            {/* Middle Side: Logistics Column Spread (Flex-2) */}
            <div className="flex-1 lg:flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:border-l lg:border-black/5 lg:pl-8">
              {/* Venue Block */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin size={13} className="text-[#1E67FC]" weight="duotone" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Venue / Platform</span>
                </div>
                <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight truncate leading-snug">
                  {eventItem.venue || 'TBA'}
                </p>
                {eventItem.chapter && (
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#1E67FC] truncate">
                    {eventItem.chapter.name}
                  </p>
                )}
              </div>

              {/* Schedule Block */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={13} className="text-[#1E67FC]" weight="duotone" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Schedule / Duration</span>
                </div>
                <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight leading-snug">
                  {formatEventRange(eventItem.date, eventItem.endDate)}
                </p>
              </div>
            </div>
 
            {/* Right Side: Manager actions */}
            {canManageEvent(eventItem) && (
              <div className="flex-shrink-0 flex items-center justify-end gap-1.5 lg:border-l lg:border-black/5 lg:pl-8 border-t border-black/5 lg:border-t-0 pt-4 lg:pt-0 w-full lg:w-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(eventItem); }} 
                  className="w-8 h-8 bg-slate-50 text-slate-400 hover:bg-[#EBF2FF] hover:text-[#1E67FC] flex items-center justify-center transition-all border border-black/5"
                  title="Edit Program"
                >
                  <Pencil size={13} weight="duotone" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteEvent(eventItem.id); }} 
                  className="w-8 h-8 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all border border-black/5"
                  title="Delete Program"
                >
                  <Trash size={13} weight="duotone" />
                </button>
              </div>
            )}
          </div>
        ))}

        {events.length === 0 && (
          <div className="py-20 text-center bg-slate-50/30 border border-black/5">
            <ShieldWarning size={40} className="mx-auto text-slate-300 mb-4" weight="duotone" />
            <h3 className="text-lg font-black text-[#0F172A] mb-1">Calendar is currently clear</h3>
            <p className="text-slate-400 text-xs font-extrabold max-w-xs mx-auto leading-relaxed">No upcoming programs recorded in the current scope. Broadcast a new event to mobilize members.</p>
          </div>
        )}
      </div>

      {/* Modal for Creating New Event */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Broadcast Event"
        maxWidth="max-w-2xl"
        overflowVisible={true}
      >
        <form onSubmit={handleCreateEvent} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Event Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
              placeholder="e.g. National Youth Convocation"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <CustomDateTimePicker 
              label="Start Date & Time"
              value={date}
              onChange={setDate}
            />
            <CustomDateTimePicker 
              label="End Date & Time"
              value={endDate}
              onChange={setEndDate}
            />
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <CustomDropdown 
              label="Category"
              value={category}
              onChange={setCategory}
              options={[
                { label: 'Fellowship', value: 'Fellowship' },
                { label: 'Outreach', value: 'Outreach' },
                { label: 'Retreat', value: 'Retreat' },
                { label: 'Leadership', value: 'Leadership' },
                { label: 'Project', value: 'Project' }
              ]}
            />
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Venue / Platform</label>
              <input 
                type="text" 
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
                placeholder="e.g. Main Auditorium or Zoom Link"
              />
            </div>
          </div>
 
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Program Details</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400 min-h-[120px] resize-none"
              placeholder="Share the vision or outline details for this session..."
            />
          </div>
 
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
              {submitting ? 'Broadcasting...' : 'Broadcast'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Editing Existing Event */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Mission Event"
        maxWidth="max-w-2xl"
        overflowVisible={true}
      >
        <form onSubmit={handleUpdateEvent} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Event Title</label>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
              placeholder="e.g. National Youth Convocation"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <CustomDateTimePicker 
              label="Start Date & Time"
              value={editDate}
              onChange={setEditDate}
            />
            <CustomDateTimePicker 
              label="End Date & Time"
              value={editEndDate}
              onChange={setEditEndDate}
            />
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <CustomDropdown 
              label="Category"
              value={editCategory}
              onChange={setEditCategory}
              options={[
                { label: 'Fellowship', value: 'Fellowship' },
                { label: 'Outreach', value: 'Outreach' },
                { label: 'Retreat', value: 'Retreat' },
                { label: 'Leadership', value: 'Leadership' },
                { label: 'Project', value: 'Project' }
              ]}
            />
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Venue / Platform</label>
              <input 
                type="text" 
                value={editVenue}
                onChange={(e) => setEditVenue(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
                placeholder="e.g. Main Auditorium or Zoom Link"
              />
            </div>
          </div>
 
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest block ml-1">Program Details</label>
            <textarea 
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400 min-h-[120px] resize-none"
              placeholder="Share the vision or outline details for this session..."
            />
          </div>
 
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-6 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex-[2] px-6 h-12 bg-[#1E67FC] hover:bg-[#0F53D6] text-white font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
