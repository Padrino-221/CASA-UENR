'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Envelope,
  Shield,
  Buildings,
  MapPin,
  Key,
  CaretRight,
  ShieldCheck,
  Building
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { HeaderSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';
import { formatRoleLabel } from '@/lib/utils';

export default function ProfilePage() {
  const { update } = useSession();
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setName(data.name);
      } else {
        notification.error('Could not load profile.');
      }
    } catch {
      notification.error('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Handle Password Change if requested
      if (password) {
        if (password !== confirmPassword) {
          notification.warning('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        if (!currentPassword) {
          notification.warning('Current password is required.');
          setIsSubmitting(false);
          return;
        }

        const passRes = await fetch('/api/profile/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword: password })
        });

        if (!passRes.ok) {
          const err = await passRes.json();
          throw new Error(err.error || 'Security verification failed.');
        }
      }

      // 2. Handle Name Change
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        notification.success('Profile updated.');
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        await update({ name });
        fetchProfile();
      } else {
        notification.error('Failed to update profile.');
      }
    } catch (err) {
      notification.error((err as Error).message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (userName?: string) => {
    if (!userName) return '??';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading && !profile) {
    return <ProfileLoadingSkeleton />;
  }

  const roleColors: Record<string, string> = {
    'NATIONAL_ADMIN': 'bg-[#0F172A]',
    'REGIONAL_ADMIN': 'bg-[#1E67FC]',
    'LOCAL_ADMIN': 'bg-[#0F53D6]'
  };

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto stagger-fade-in">

      {/* Hero Profile Section */}
      <header className="bg-white border border-black/5 p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 lg:gap-8 w-full">
          <div className={`w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 sm: lg: ${roleColors[profile?.role] || 'bg-slate-200'} text-white flex items-center justify-center text-xl sm:text-3xl lg:text-4xl font-black border-4 border-white transform hover:scale-105 transition-transform duration-300`}>
            {getInitials(profile?.name)}
          </div>

          <div className="text-center md:text-left flex-grow">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">{profile?.name}</h1>
              <p className="text-xs uppercase font-extrabold text-slate-400 tracking-widest mt-2.5">{profile?.email}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF2FF] text-[#1E67FC] border border-[#1E67FC]/10">
                <Shield size={14} weight="duotone" />
                <span className="text-[10px] uppercase font-black tracking-widest">{formatRoleLabel(profile?.role)}</span>
              </div>
              {profile?.region && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 border border-black/5">
                  <MapPin size={14} weight="duotone" />
                  <span className="text-[10px] uppercase font-black tracking-widest">{profile.region.name}</span>
                </div>
              )}
              {profile?.chapter && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 border border-black/5">
                  <Buildings size={14} weight="duotone" />
                  <span className="text-[10px] uppercase font-black tracking-widest">{profile.chapter?.name ?? 'Unassigned'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Editable Profile */}
        <div className="lg:col-span-12">
          <div className="bg-white border border-black/5 p-4 sm:p-6 lg:p-10">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-8 flex items-center gap-3">
              <User size={24} className="text-[#1E67FC]" weight="duotone" />
              <span>Account</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Legal Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E67FC] transition-colors" weight="duotone" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] focus:bg-white transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-75">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">System Email (Locked)</label>
                  <div className="relative">
                    <Envelope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" weight="duotone" />
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-transparent font-extrabold text-sm text-slate-500 cursor-not-allowed select-all"
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 ml-1">Used for authentication. Contact a National Admin to change it.</p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 lg:p-8 border border-black/5 space-y-6 mt-4">
                <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                  <Key size={16} className="text-amber-500" weight="duotone" />
                  <span>Change Password</span>
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-4 bg-white border border-black/5 focus:outline-none focus:border-[#1E67FC] focus:ring-4 focus:ring-amber-500/10 transition-all font-extrabold text-sm text-[#0F172A]"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 bg-white border border-black/5 focus:outline-none focus:border-[#1E67FC] focus:ring-4 focus:ring-blue-500/10 transition-all font-extrabold text-sm text-[#0F172A]"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-4 bg-white border border-black/5 focus:outline-none focus:border-[#1E67FC] focus:ring-4 focus:ring-blue-500/10 transition-all font-extrabold text-sm text-[#0F172A]"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col text-center sm:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Created</span>
                  <span className="text-xs font-extrabold text-[#1E67FC]">{new Date(profile?.createdAt || Date.now()).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 h-14 bg-[#1E67FC] hover:bg-[#0F53D6] text-white font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    'Synchronizing...'
                  ) : (
                    <>
                      <span>Save Changes</span>
                      <CaretRight size={16} weight="duotone" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Oversight Transparency */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-black/5 p-4 sm:p-6 lg:p-8 group hover:border-[#1E67FC]/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#EBF2FF] text-[#1E67FC] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} weight="duotone" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Role</h4>
                  <p className="text-lg font-black text-[#0F172A]">{formatRoleLabel(profile?.role)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/5 p-4 sm:p-6 lg:p-8 group hover:border-rose-500/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={28} weight="duotone" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Region</h4>
                  <p className="text-lg font-black text-[#0F172A]">
                    {profile?.role === 'NATIONAL_ADMIN'
                      ? 'National'
                      : (profile?.region?.name || profile?.chapter?.region?.name || 'Local')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/5 p-4 sm:p-6 lg:p-8 group hover:border-amber-500/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building size={28} weight="duotone" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Chapter</h4>
                  <p className="text-lg font-black text-[#0F172A] truncate max-w-full">{profile?.chapter?.name || 'All Chapters'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto stagger-fade-in">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <TableAreaSkeleton />
        </div>
      </div>
    </div>
  );
}
