'use client';

import { useEffect, useState } from 'react';
import { Shield, Key, Eye, EyeSlash } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { HeaderSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';
import { formatRoleLabel } from '@/lib/utils';

interface Profile {
  name: string; email: string; role: string; createdAt: string;
  region?: { name: string };
  chapter?: { name: string; region?: { name: string } };
}

export default function ProfilePage() {
  const { update } = useSession();
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Could not load your profile.');
      const data: Profile = await res.json();
      setProfile(data); setName(data.name || '');
    } catch { notification.error('Could not load your profile. Please try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProfile(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) });
      if (!res.ok) throw new Error('Could not save your profile.');
      setProfile(previous => previous ? { ...previous, name: name.trim() } : previous);
      setName(name.trim());
      await update({ name: name.trim() });
      notification.success('Profile updated.');
    } catch { notification.error('Could not save your profile. Please try again.'); }
    finally { setSavingName(false); }
  };
  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) { notification.warning('New passwords do not match.'); return; }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/profile/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword: password }) });
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || 'Could not update password.'); }
      setCurrentPassword(''); setPassword(''); setConfirmPassword('');
      notification.success('Password updated.');
    } catch (error) { notification.error(error instanceof Error ? error.message : 'Could not update password.'); }
    finally { setSavingPassword(false); }
  };

  if (loading && !profile) return <div className="space-y-6"><HeaderSkeleton /><TableAreaSkeleton /></div>;
  if (!profile) return <section className="profile-error"><h1>Profile unavailable</h1><p>Your account details could not be loaded.</p><button className="btn-lux-primary" onClick={fetchProfile}>Try again</button></section>;
  const initials = profile.name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U';

  return <div className="profile-page">
    <header className="premium-header"><div className="header-content-root"><div><h1>My profile</h1><p>Manage your personal details and account security.</p></div></div></header>
    <div className="profile-layout">
      <aside className="profile-summary">
        <div className="profile-summary-top"><div className="profile-avatar" aria-hidden="true">{initials}</div><h2>{profile.name}</h2><p>{profile.email}</p><span className="profile-role"><Shield size={15} />{formatRoleLabel(profile.role)}</span></div>
        <dl>
          <div><dt>Region</dt><dd>{profile.role === 'NATIONAL_ADMIN' ? 'National' : profile.region?.name || profile.chapter?.region?.name || 'Not assigned'}</dd></div>
          <div><dt>Chapter</dt><dd>{profile.chapter?.name || (profile.role === 'NATIONAL_ADMIN' || profile.role === 'REGIONAL_ADMIN' ? 'All chapters in your scope' : 'Not assigned')}</dd></div>
          <div><dt>Member since</dt><dd>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not available'}</dd></div>
        </dl>
      </aside>
      <div className="profile-forms">
        <section className="profile-panel">
          <header><h2>Personal details</h2><p>Your name appears in the admin system and activity logs.</p></header>
          <form onSubmit={saveName}>
            <div className="profile-fields">
              <div className="profile-field"><label htmlFor="profile-name">Full name</label><input id="profile-name" name="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required disabled={savingName} /></div>
              <div className="profile-field"><label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" autoComplete="username" value={profile.email} readOnly aria-describedby="profile-email-help" /><p id="profile-email-help">Contact a national administrator to change your sign-in email.</p></div>
            </div>
            <footer><button type="submit" className="btn-lux-primary" disabled={savingName || !name.trim() || name.trim() === profile.name}>{savingName ? 'Saving...' : 'Save changes'}</button></footer>
          </form>
        </section>
        <section className="profile-panel">
          <header className="profile-security-heading"><div><h2><Key size={20} /> Password &amp; security</h2><p>Use a password you do not use for other accounts.</p></div><button type="button" className="profile-visibility" aria-pressed={showPasswords} onClick={() => setShowPasswords(value => !value)}>{showPasswords ? <EyeSlash size={18} /> : <Eye size={18} />}{showPasswords ? 'Hide' : 'Show'}</button></header>
          <form onSubmit={savePassword}>
            <div className="profile-fields">
              <div className="profile-field profile-field-full"><label htmlFor="profile-current-password">Current password</label><input id="profile-current-password" type={showPasswords ? 'text' : 'password'} autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required disabled={savingPassword} /></div>
              <div className="profile-field"><label htmlFor="profile-new-password">New password</label><input id="profile-new-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={savingPassword} /></div>
              <div className="profile-field"><label htmlFor="profile-confirm-password">Confirm new password</label><input id="profile-confirm-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required disabled={savingPassword} /></div>
            </div>
            <footer><button type="submit" className="btn-lux-primary" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update password'}</button></footer>
          </form>
        </section>
      </div>
    </div>
  </div>;
}
