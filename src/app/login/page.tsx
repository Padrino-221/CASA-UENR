'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import {
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  SpinnerGap,
  WarningCircle,
  Check,
  ArrowRight,
} from '@phosphor-icons/react';

import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rememberMe, setRememberMe] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  React.useEffect(() => {
    const cachedEmail = localStorage.getItem('uchms_remember_email');
    if (cachedEmail) {
      setEmail(cachedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (rememberMe) localStorage.setItem('uchms_remember_email', email);
    else localStorage.removeItem('uchms_remember_email');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else {
        const session = await getSession();
        const role = session?.user?.role;
        const destination =
          role === 'CONTENT_MANAGER'
            ? '/content'
            : role === 'REGIONAL_ADMIN'
              ? '/regional'
              : role === 'LOCAL_ADMIN'
                ? '/local'
                : '/dashboard';
        window.location.href = destination;
      }
    } catch {
      setError('An error occurred while signing in. Please try again later.');
      setLoading(false);
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryStatus('loading');
    setTimeout(() => {
      setRecoveryStatus('success');
      setTimeout(() => {
        setShowRecovery(false);
        setRecoveryStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F7FC] overflow-hidden">

      {/* ============ Left: CASA brand panel ============ */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-[#0D47A1] overflow-hidden">
        <div className="relative w-full flex flex-col justify-center p-8 xl:p-12">

          {/* Navbar-style brand mark */}
          <div className="flex items-center gap-2.5">
            <Image src="/casa-logo-white.png" alt="CASA UENR logo" width={48} height={48} className="w-12 h-12 shrink-0" />
            <span className="text-white text-[18px] font-bold tracking-[-0.02em]">CASA UENR</span>
            <span className="ml-1 text-white/40 text-[11px] font-medium tracking-wide hidden 2xl:inline">
              Christ Apostolic Students &amp; Associates
            </span>
          </div>

          {/* Hero-style headline + support + verse */}
          <div className="pt-8">
            <h1 className="text-white text-[36px] xl:text-[44px] font-bold leading-[1.07] tracking-[-0.035em] max-w-[560px]">
              Rooted in <span className="serif-accent text-[#90CAF9]">Christ,</span>
              <br /> raised for purpose
            </h1>
            <p className="mt-4 text-white/[0.78] text-[15px] leading-[1.65] max-w-[320px]">
              Sign in to manage the chapters, members, offerings, events, and
              records of the CASA UENR family.
            </p>

            {/* Verse */}
            <div className="mt-8 flex items-center gap-3 pt-4">
              <p className="serif-accent text-white/85 text-[16px] leading-snug">
                &ldquo;You are the light of the world. A city set on a hill cannot be hidden.&rdquo;
              </p>
              <span className="shrink-0 bg-[#E3F2FD] text-[#0D47A1] text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5">
                Matthew 5:14
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Right: Login form ============ */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 bg-[#F4F7FC] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none bg-[#E3F2FD]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none bg-blue-100/60" />

        <div className="w-full max-w-[420px] relative z-10 animate-flow">
          {/* Mobile brand header */}
          <header className="mb-6">
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <Image src="/casa-logo-white.png" alt="CASA UENR logo" width={40} height={40} className="w-10 h-10 shrink-0" style={{ filter: 'brightness(0)' }} />
              <span className="text-[#0F172A] text-[18px] font-bold tracking-[-0.02em]">CASA UENR</span>
            </div>

            <span className="badge-pill">Secure Access</span>
            <h3 className="mt-4 text-[26px] sm:text-3xl font-bold text-[#0F172A] tracking-tight leading-[1.08]">
              Welcome <span className="serif-accent text-[#0D47A1]">back</span>
            </h3>
            <p className="text-[#475569] font-medium text-sm leading-relaxed mt-2">
              Sign in to manage your chapters, members, and ministry records.
            </p>
          </header>

          {/* Reference-style editorial card */}
          <div className="bg-white border border-[#E2E8F0]/70 p-6 sm:p-7">
            {error && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-100 flex items-center gap-4 text-rose-600 text-[13px] font-bold animate-shake">
                <div className="w-10 h-10 bg-white flex items-center justify-center shrink-0 border border-rose-100">
                  <WarningCircle size={20} weight="duotone" />
                </div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="field-label">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D47A1] transition-colors pointer-events-none">
                    <Envelope size={18} weight="duotone" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@ministry.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                    style={{ paddingLeft: '3rem', paddingRight: '1.25rem' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="field-label !mb-2">Password</label>
                  <button type="button" onClick={() => setShowRecovery(true)} className="text-[10px] font-black text-[#0D47A1] hover:text-[#1565C0] transition-colors uppercase tracking-[0.16em] mb-2">Forgot password?</button>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D47A1] transition-colors pointer-events-none">
                    <Lock size={18} weight="duotone" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input"
                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0D47A1] transition-all"
                  >
                    {showPassword ? <EyeSlash size={18} weight="duotone" /> : <Eye size={18} weight="duotone" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-[#0D47A1] border-[#0D47A1]' : 'border-[#E2E8F0] bg-white group-hover:border-[#0D47A1]'}`}>
                    {rememberMe && <Check size={12} className="text-white" weight="bold" />}
                  </div>
                  <span className="text-[12px] font-bold text-[#475569] group-hover:text-[#0F172A] transition-colors">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn bg-[#0D47A1] border-[#0D47A1] text-white hover:bg-[#1565C0] hover:border-[#1565C0] w-full h-12 justify-center mt-1"
              >
                {loading ? (
                  <SpinnerGap className="animate-spin" size={20} weight="duotone" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="btn-circle bg-[#90CAF9] text-[#0D47A1]">
                      <ArrowRight size={13} weight="bold" />
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer link back to public site */}
          <div className="mt-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-[#E2E8F0]" />
            <Link
              href="/"
              className="text-[11px] font-black text-[#475569] hover:text-[#0D47A1] uppercase tracking-[0.16em] transition-colors shrink-0"
            >
              Visit the public site
            </Link>
            <span className="h-px flex-1 bg-[#E2E8F0]" />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRecovery}
        onClose={() => { setShowRecovery(false); setRecoveryStatus('idle'); }}
        title="Reset Password"
      >
        {recoveryStatus === 'success' ? (
          <div className="py-8 text-center animate-flow">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 border border-emerald-100">
              <Check size={40} weight="duotone" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Check Your Email</h3>
            <p className="text-[#475569] font-medium text-sm max-w-[260px] mx-auto leading-relaxed">
              We have sent password reset instructions to your email address.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleRecoverySubmit}>
            <div>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                placeholder="name@ministry.edu"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                autoFocus
                className="input"
              />
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
              <button type="button" onClick={() => setShowRecovery(false)} className="px-5 h-12 text-[#475569] hover:text-[#0F172A] font-black text-[11px] uppercase tracking-[0.16em] transition-colors">Cancel</button>
              <button
                type="submit"
                disabled={recoveryStatus === 'loading' || !recoveryEmail}
                className="btn bg-[#0D47A1] border-[#0D47A1] text-white hover:bg-[#1565C0] h-12 justify-center min-w-[180px]"
              >
                {recoveryStatus === 'loading' ? <SpinnerGap className="animate-spin" size={18} weight="duotone" /> : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="btn-circle bg-[#90CAF9] text-[#0D47A1]">
                      <ArrowRight size={13} weight="bold" />
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}