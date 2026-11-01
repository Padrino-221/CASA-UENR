'use client';

import { useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, EyeSlash, SpinnerGap, WarningCircle } from '@phosphor-icons/react';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem('uchms_remember_email');
        if (saved) { setEmail(saved); setRememberEmail(true); }
      } catch { /* Sign-in remains available if browser storage is blocked. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      try {
        if (rememberEmail) localStorage.setItem('uchms_remember_email', email.trim());
        else localStorage.removeItem('uchms_remember_email');
      } catch { /* Remembering an email is optional. */ }
      const result = await signIn('credentials', { email: email.trim(), password, redirect: false });
      if (!result?.ok || result.error) {
        setError('Your email or password is incorrect. Please try again.');
        setLoading(false);
        return;
      }
      const session = await getSession();
      if (!session?.user) {
        setError('We could not confirm your session. Please try signing in again.');
        setLoading(false);
        return;
      }
      const destinations: Record<string, string> = {
        CONTENT_MANAGER: '/content', REGIONAL_ADMIN: '/regional', LOCAL_ADMIN: '/local',
        FINANCE: '/collections', SECRETARY: '/students', NATIONAL_ADMIN: '/dashboard',
      };
      window.location.assign(destinations[session.user.role || ''] || '/dashboard');
    } catch {
      setError('We could not connect. Check your connection and try again.');
      setLoading(false);
    }
  }

  return <main className="admin-signin">
    <aside className="signin-story" aria-label="CASA UENR administration">
      <Link href="/" className="signin-brand"><Image src="/casa-logo.png" alt="" width={54} height={54}/><span>CASA UENR<small>Church management</small></span></Link>
      <div className="signin-story-copy"><h2>Serving the church.<br/>Supporting the people.</h2><p>One place to care for your fellowship, organise your chapter, and keep ministry moving.</p></div>

      <p className="signin-story-note">University of Energy and Natural Resources · Sunyani</p>
    </aside>
    <section className="signin-main" aria-labelledby="signin-title">
      <div className="signin-form-wrap">
        <Link href="/" className="signin-mobile-brand"><span><Image src="/casa-logo.png" alt="" width={42} height={42}/></span>CASA UENR</Link>
        <header className="signin-heading"><p>Administration</p><h1 id="signin-title">Welcome back</h1><div>Sign in to your account to manage your fellowship.</div></header>
        {error && <div className="signin-error" role="alert" id="signin-error"><WarningCircle size={22} aria-hidden="true"/><p>{error}</p></div>}
        <form onSubmit={handleLogin} aria-busy={loading}>
          <div className="signin-field"><label htmlFor="signin-email">Email address</label><input id="signin-email" name="email" type="email" autoComplete="username" inputMode="email" placeholder="you@example.com" value={email} onChange={event=>setEmail(event.target.value)} required disabled={loading} aria-describedby={error ? 'signin-error' : undefined}/></div>
          <div className="signin-field"><label htmlFor="signin-password">Password</label><div className="signin-password"><input id="signin-password" name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event=>setPassword(event.target.value)} required disabled={loading} aria-describedby={error ? 'signin-error' : undefined}/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword}>{showPassword?<EyeSlash size={21}/>:<Eye size={21}/>}</button></div></div>
          <div className="signin-options"><label><input type="checkbox" checked={rememberEmail} onChange={event=>setRememberEmail(event.target.checked)} disabled={loading}/><span>Remember my email</span></label></div>
          <button className="signin-submit" type="submit" disabled={loading}>{loading?<><SpinnerGap size={21} className="signin-spinner" aria-hidden="true"/> Signing in…</>:<>Sign in <ArrowRight size={20} aria-hidden="true"/></>}</button>
        </form>
        <div className="signin-help"><h2>Need help signing in?</h2><p>Contact your chapter administrator for account access or a password reset. <Link href="/contact">Contact the fellowship</Link></p></div>
      </div>
      <p className="signin-access-note">For authorised CASA UENR administrators and ministry teams.</p>
    </section>
  </main>;
}
