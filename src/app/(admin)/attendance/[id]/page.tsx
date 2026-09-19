'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { 
  CaretLeft, 
  CalendarBlank, 
  Users, 
  GenderMale, 
  GenderFemale, 
  MicrophoneStage, 
  BookOpen, 
  WarningCircle, 
  ChatCenteredText, 
  Smiley,
  FloppyDisk,
  Building,
  Article,
  Trash,
  Image as ImageIcon,
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import CustomDropdown from '@/components/ui/CustomDropdown';

const CHALLENGE_OPTIONS = [
  { label: 'Low Attendance', value: 'Low Attendance' },
  { label: 'Venue Issues', value: 'Venue Issues' },
  { label: 'Technical Issues', value: 'Technical Issues' },
  { label: 'Financial Constraints', value: 'Financial Constraints' },
  { label: 'Time Management', value: 'Time Management' },
  { label: 'Member Indiscipline', value: 'Member Indiscipline' },
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Administrative Issues', value: 'Administrative Issues' },
  { label: 'None', value: 'None' },
  { label: 'Other (please specify)', value: '__OTHER__' }
];

export default function AttendanceSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const notification = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attendanceSession, setAttendanceSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Aggregated Report Fields
  const [totalAttendance, setTotalAttendance] = useState<string>('');
  const [totalMales, setTotalMales] = useState<string>('');
  const [totalFemales, setTotalFemales] = useState<string>('');
  const [speaker, setSpeaker] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');
  const [challengeOther, setChallengeOther] = useState<string>('');
  const [attitudeOfExecutives, setAttitudeOfExecutives] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    fetchSessionDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceSession(data);
        
        setTotalAttendance(data.totalAttendance !== null ? data.totalAttendance.toString() : '');
        setTotalMales(data.totalMales !== null ? data.totalMales.toString() : '');
        setTotalFemales(data.totalFemales !== null ? data.totalFemales.toString() : '');
        setSpeaker(data.speaker || '');
        setTopic(data.topic || '');
        
        const challengeVal = data.challenges || '';
        const isPredefined = CHALLENGE_OPTIONS.some(o => o.value !== '__OTHER__' && o.value === challengeVal);
        if (isPredefined || challengeVal === '') {
          setChallenges(challengeVal);
          setChallengeOther('');
        } else {
          setChallenges('__OTHER__');
          setChallengeOther(challengeVal);
        }
        
        setAttitudeOfExecutives(data.attitudeOfExecutives || 'Excellent');
        setRemarks(data.remarks || '');
      } else {
        notification.error('Failed to load session details.');
      }
    } catch {
      notification.error('Data synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const nAttendance = totalAttendance === '' ? null : parseInt(totalAttendance);
      const nMales = totalMales === '' ? null : parseInt(totalMales);
      const nFemales = totalFemales === '' ? null : parseInt(totalFemales);

      if (nAttendance !== null && nMales !== null && nFemales !== null && nMales + nFemales > nAttendance) {
        notification.error('Male + Female count cannot exceed total attendance.');
        setSaving(false);
        return;
      }

      const challengesValue = challenges === '__OTHER__' ? challengeOther : challenges;
      const res = await fetch(`/api/attendance/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAttendance: nAttendance,
          totalMales: nMales,
          totalFemales: nFemales,
          speaker,
          topic,
          challenges: challengesValue,
          attitudeOfExecutives,
          remarks
        })
      });

      if (res.ok) {
        notification.success('Session report saved successfully.');
        fetchSessionDetails();
      } else {
        notification.error('Failed to save session report.');
      }
    } catch {
      notification.error('Communication error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/attendance/sessions/${id}/image`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setAttendanceSession((prev: Record<string, unknown> | null) => ({ ...prev, imageUrl: data.imageUrl }));
        notification.success('Image uploaded successfully.');
      } else {
        const err = await res.json();
        notification.error(err.error || 'Failed to upload image.');
      }
    } catch {
      notification.error('Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    try {
      const res = await fetch(`/api/attendance/sessions/${id}/image`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAttendanceSession((prev: Record<string, unknown> | null) => ({ ...prev, imageUrl: null }));
        notification.success('Image removed.');
      } else {
        notification.error('Failed to remove image.');
      }
    } catch {
      notification.error('Remove failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !attendanceSession) {
    return (
      <div className="space-y-8 w-full animate-pulse">
        <div className="w-40 h-6 bg-slate-100 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-3">
            <div className="w-80 h-10 bg-slate-100" />
            <div className="flex gap-3">
              <div className="w-28 h-6 bg-slate-50" />
              <div className="w-28 h-6 bg-slate-50" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[120px] bg-slate-50/20 border border-slate-100" />
          ))}
        </div>
        <div className="h-64 w-full bg-slate-50 mt-8" />
      </div>
    );
  }

  if (!attendanceSession) {
    return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Session context not found.</div>;
  }

  const isLocalAdmin = session?.user?.role === 'LOCAL_ADMIN';

  return (
    <div className="space-y-8 w-full pb-20 stagger-fade-in max-w-[1200px] mx-auto">
      
      {/* Return Back Navigation */}
      <div>
        <Link 
          href="/attendance" 
          className="flex items-center gap-2.5 text-slate-400 hover:text-[#1E67FC] font-black uppercase tracking-widest text-[10px] transition-colors mb-6 group w-fit"
        >
          <div className="w-8 h-8 bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#EBF2FF] group-hover:text-[#1E67FC] transition-colors border border-black/5">
            <CaretLeft size={16} weight="bold" />
          </div>
          Return to List
        </Link>

        {/* Header Block */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#1E67FC] font-black text-[10px] uppercase tracking-widest">
              <Building size={14} weight="bold" />
              <span>{attendanceSession.chapter?.name || 'Local Chapter'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none mb-3">
              {attendanceSession.title || 'Attendance Session'}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EBF2FF] text-[#1E67FC] border border-[#1E67FC]/10 text-[10px] font-black uppercase tracking-widest">
                <CalendarBlank size={14} weight="bold" />
                <span>{new Date(attendanceSession.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 border border-black/5 text-[10px] font-black uppercase tracking-widest">
                <Article size={14} weight="bold" />
                <span>{attendanceSession.serviceType}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {isLocalAdmin ? (
        /* ==================== EDITABLE FORM FOR LOCAL ADMIN ==================== */
        <form onSubmit={handleSaveReport} className="space-y-8">
          
          {/* Headcount Input Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium p-5 flex flex-col justify-between hover:border-[#1E67FC]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Number of Attendance</span>
                <div className="w-10 h-10 bg-[#1E67FC]/10 text-[#1E67FC] flex items-center justify-center shrink-0">
                  <Users size={20} weight="bold" />
                </div>
              </div>
              <input 
                type="number"
                placeholder="Total Attendees"
                value={totalAttendance}
                onChange={e => setTotalAttendance(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-black text-xl text-[#0F172A]"
              />
            </div>

            <div className="card-premium p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Total Males</span>
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <GenderMale size={20} weight="bold" />
                </div>
              </div>
              <input 
                type="number"
                placeholder="Male Count"
                value={totalMales}
                onChange={e => setTotalMales(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-black text-xl text-[#0F172A]"
              />
            </div>

            <div className="card-premium p-5 flex flex-col justify-between hover:border-pink-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Total Females</span>
                <div className="w-10 h-10 bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                  <GenderFemale size={20} weight="bold" />
                </div>
              </div>
              <input 
                type="number"
                placeholder="Female Count"
                value={totalFemales}
                onChange={e => setTotalFemales(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-black text-xl text-[#0F172A]"
              />
            </div>
          </div>

          {/* Service Image Upload */}
          <div className="bg-white border border-black/5 p-8 space-y-6">
            <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-4">Service Snapshot</h3>
            {attendanceSession.imageUrl ? (
              <div className="relative group">
                <img src={attendanceSession.imageUrl} 
                  alt="Service"
                  className="w-full h-48 object-cover border border-black/5" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <Trash size={18} weight="duotone" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#1E67FC] hover:bg-[#EBF2FF]/30 transition-all"
              >
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400">
                  <ImageIcon size={24} />
                </div>
                <span className="text-xs font-extrabold text-slate-400">{uploading ? 'Uploading...' : 'Click to upload a photo of the service'}</span>
                <span className="text-[9px] text-slate-300 font-semibold">JPG, PNG, WebP &middot; Max 5MB</span>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Speaker, Topic & Executive Attitude */}
          <div className="bg-white border border-black/5 p-8 space-y-6">
            <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-4">Service & Speaker Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Speaker Name</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Enter guest or resident speaker..."
                    value={speaker}
                    onChange={e => setSpeaker(e.target.value)}
                    required
                    className="w-full p-4 pl-12 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A]"
                  />
                  <MicrophoneStage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} weight="duotone" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Topic / Sermon Theme</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. Grace and Leadership"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    required
                    className="w-full p-4 pl-12 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A]"
                  />
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} weight="duotone" />
                </div>
              </div>
            </div>

            <CustomDropdown
              label="Attitude of Executives"
              value={attitudeOfExecutives}
              onChange={setAttitudeOfExecutives}
              options={[
                { label: 'Excellent', value: 'Excellent' },
                { label: 'Good', value: 'Good' },
                { label: 'Fair', value: 'Fair' },
                { label: 'Indifferent', value: 'Indifferent' }
              ]}
            />
          </div>

          {/* Challenges & Remarks */}
          <div className="bg-white border border-black/5 p-8 space-y-6">
            <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-4">Ministry Diagnosis & Remarks</h3>

            <div>
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Challenges Encountered</label>
              <CustomDropdown
                value={challenges}
                onChange={setChallenges}
                options={CHALLENGE_OPTIONS}
              />
              {challenges === '__OTHER__' && (
                <div className="relative mt-3">
                  <textarea 
                    placeholder="Describe the challenge..."
                    value={challengeOther}
                    onChange={e => setChallengeOther(e.target.value)}
                    rows={3}
                    className="w-full p-4 pl-12 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] resize-none"
                  />
                  <WarningCircle className="absolute left-4 top-5 text-slate-400" size={18} weight="duotone" />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Remarks</label>
              <div className="relative">
                <textarea 
                  placeholder="Provide additional remarks, decisions, or action points..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full p-4 pl-12 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] resize-none"
                />
                <ChatCenteredText className="absolute left-4 top-5 text-slate-400" size={18} weight="duotone" />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button 
              type="submit"
              disabled={saving}
              className="px-8 h-14 bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <FloppyDisk size={18} weight="bold" />
              <span>{saving ? 'Saving Report...' : 'Save Session Report'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* ==================== PREMIUM READ-ONLY DASHBOARD VIEW FOR NATIONAL/REGIONAL ==================== */
        <div className="space-y-8 animate-flow">
          
          {/* Headcount Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium p-5 !flex-row !items-center gap-4 hover:border-[#1E67FC]/30 transition-all duration-300">
              <div className="w-16 h-16 bg-[#1E67FC] text-white flex items-center justify-center shrink-0 ring-6 ring-[#1E67FC]/15">
                <Users size={26} weight="bold" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] block">attendance headcount</span>
                <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-none mt-1">
                  {attendanceSession.totalAttendance !== null ? attendanceSession.totalAttendance.toLocaleString() : 'N/A'}
                </h3>
              </div>
            </div>

            <div className="card-premium p-5 !flex-row !items-center gap-4 hover:border-blue-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center shrink-0 ring-6 ring-blue-500/15">
                <GenderMale size={26} weight="bold" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] block">male attendees</span>
                <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-none mt-1">
                  {attendanceSession.totalMales !== null ? attendanceSession.totalMales.toLocaleString() : 'N/A'}
                </h3>
              </div>
            </div>

            <div className="card-premium p-5 !flex-row !items-center gap-4 hover:border-pink-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-pink-500 text-white flex items-center justify-center shrink-0 ring-6 ring-pink-500/15">
                <GenderFemale size={26} weight="bold" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] block">female attendees</span>
                <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-none mt-1">
                  {attendanceSession.totalFemales !== null ? attendanceSession.totalFemales.toLocaleString() : 'N/A'}
                </h3>
              </div>
            </div>
          </div>

          {/* Service Snapshot Image */}
          {attendanceSession.imageUrl && (
            <div className="bg-white border border-black/5 p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ImageIcon size={16} weight="bold" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">Service Snapshot</h3>
              </div>
              <div>
                <img src={attendanceSession.imageUrl} 
                  alt="Service"
                  className="w-full max-h-[500px] object-cover border border-black/5" />
              </div>
            </div>
          )}

          {/* Service & Speaker Readonly Panel */}
          <div className="bg-white border border-black/5 p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <BookOpen size={16} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Service Proceedings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-50 border border-black/5">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Speaker Name</span>
                <div className="flex items-center gap-2 mt-1">
                  <MicrophoneStage size={18} className="text-[#1E67FC]" weight="duotone" />
                  <span className="font-extrabold text-sm text-[#0F172A]">{attendanceSession.speaker || 'No Speaker Registered'}</span>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-black/5">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Sermon / Topic</span>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen size={18} className="text-[#1E67FC]" weight="duotone" />
                  <span className="font-extrabold text-sm text-[#0F172A]">{attendanceSession.topic || 'No Topic Registered'}</span>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-black/5">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Attitude of Executives</span>
                <div className="flex items-center gap-2 mt-1">
                  <Smiley size={18} className="text-[#1E67FC]" weight="duotone" />
                  <span className="font-extrabold text-sm text-[#0F172A]">{attendanceSession.attitudeOfExecutives || 'Excellent'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostics and Remarks Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-black/5 p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <WarningCircle size={16} weight="bold" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">Challenges Encountered</h3>
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed min-h-[80px]">
                {attendanceSession.challenges || 'No specific challenges reported by the branch secretary.'}
              </p>
            </div>

            <div className="bg-white border border-black/5 p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-[#1E67FC]/10 text-[#1E67FC] flex items-center justify-center">
                  <ChatCenteredText size={16} weight="bold" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">Remarks</h3>
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed min-h-[80px]">
                {attendanceSession.remarks || 'No general remarks cataloged for this session.'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
