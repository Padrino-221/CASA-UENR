'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlass,
  MapTrifold,
  Question,
  SpinnerGap,
  User,
  Building,
  Globe,
  List,
  X,
  Layout,
  Users,
  Buildings,
  Wallet,
  CalendarBlank,
  ShieldCheck,
  FileText,
  ClockCounterClockwise
} from '@phosphor-icons/react';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserMenu } from './layout/UserMenu';
import { NotificationsMenu } from './layout/NotificationsMenu';
import HelpModal from './HelpModal';
import { useSearch } from '@/hooks/useSearch';
import { useGlobalSearch } from '@/context/SearchContext';
import { formatRoleLabel } from '@/lib/utils';

const TopNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const { searchQuery, setSearchQuery } = useGlobalSearch();
  const { setQuery, results, loading, showResults, setShowResults, navigateToResult } = useSearch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowResults(false);
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowResults]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setShowProfile(false);
    setShowNotifications(false);
    setShowResults(false);
  }, [pathname, setShowResults]);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  const getDashboardPath = () => {
    if (role === 'REGIONAL_ADMIN') return '/regional';
    if (role === 'LOCAL_ADMIN') return '/local';
    if (role === 'CONTENT_MANAGER') return '/content';
    if (role === 'FINANCE') return '/collections';
    if (role === 'SECRETARY') return '/students';
    return '/';
  };

  const navItems = [
    { name: 'Dashboard', icon: Layout, path: getDashboardPath(), roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Regions', icon: Globe, path: '/regions', roles: ['NATIONAL_ADMIN'] },
    { name: 'Chapters', icon: Buildings, path: '/chapters', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN'] },
    { name: 'Members', icon: Users, path: '/students', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'SECRETARY'] },
    { name: 'Attendance', icon: ShieldCheck, path: '/attendance', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'SECRETARY'] },
    { name: 'Events', icon: CalendarBlank, path: '/events', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'SECRETARY'] },
    { name: 'Calendar', icon: CalendarBlank, path: '/calendar', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'SECRETARY'] },
    { name: 'Finance', icon: Wallet, path: '/collections', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN', 'FINANCE'] },
    { name: 'Snapshot', icon: FileText, path: '/reports', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN'] },
    { name: 'Activity Logs', icon: ClockCounterClockwise, path: '/admins/logs', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => !role || item.roles.includes(role));

  const hasMoreSpecificMatch = (itemPath: string) => {
    return navItems.some((other) => other.path !== itemPath && pathname?.startsWith(other.path) && other.path.length > itemPath.length);
  };

  const checkActive = (path: string) => {
    if (!mounted || !pathname) return false;
    if (path === '/') return pathname === '/';
    if (pathname === path) return true;
    if (pathname.startsWith(path + '/')) {
      return !hasMoreSpecificMatch(path);
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-standard dark:border-slate-800 flex flex-col transition-all duration-300">
      <div className="h-[76px] lg:h-[80px] flex items-center justify-between px-4 lg:px-8 gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6 lg:gap-10 shrink-0">
          <Link href={getDashboardPath()} scroll={false} className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary text-white flex items-center justify-center">
              <ShieldCheck size={22} weight="duotone" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-main dark:text-white text-[18px] font-black tracking-tight leading-none">CASA UENR</h2>
              <p className="text-primary text-[10px] uppercase font-bold tracking-[0.1em] mt-0.5">{formatRoleLabel(role)}</p>
            </div>
          </Link>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden flex items-center justify-center w-10 h-10 bg-bg-main dark:bg-slate-800 border border-standard dark:border-slate-700 text-secondary dark:text-slate-300">
            {mobileMenuOpen ? <X size={20} weight="duotone" /> : <List size={20} weight="duotone" />}
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 lg:max-w-xl justify-end lg:justify-center">
          <div className="relative w-full max-w-[400px] hidden sm:block" ref={searchRef}>
            <div className="group flex items-center bg-bg-main dark:bg-slate-800/80 px-4 w-full border border-transparent focus-within:border-primary/30 focus-within:bg-card dark:focus-within:bg-slate-800 transition-all duration-300">
              {loading ? <SpinnerGap size={16} className="text-muted animate-spin" weight="duotone" /> : <MagnifyingGlass size={16} className="text-muted" weight="duotone" />}
              <input
                type="text" placeholder="Search chapters, members..."
                className="border-none bg-transparent py-3 px-3 text-[13px] text-main dark:text-white w-full font-medium outline-none placeholder:text-muted"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setQuery(e.target.value);
                }}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              />
            </div>
            {showResults && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-standard dark:border-slate-800 p-2 z-[1001] animate-flow">
                {results.length > 0 ? results.map((result, idx) => (
                  <button key={idx} className="flex items-center w-full p-2.5 gap-4 hover:bg-bg-main dark:hover:bg-slate-800/60 transition-colors text-left" onClick={() => { navigateToResult(result.url); setSearchQuery(''); }}>
                    <div className="w-8 h-8 bg-primary/10 dark:bg-slate-800 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                      {result.type === 'Member' ? <User size={14} weight="duotone" /> : result.type === 'Branch' ? <Building size={14} weight="duotone" /> : <MapTrifold size={14} weight="duotone" />}
                    </div>
                    <div className="flex flex-col min-w-0"><span className="block text-[13px] font-bold text-main dark:text-white truncate">{result.title}</span><span className="block text-[11px] font-medium text-muted truncate">{result.subtitle}</span></div>
                  </button>
                )) : <div className="p-4 text-center text-[12px] font-medium text-muted">No results found.</div>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center w-10 h-10 text-muted hover:text-primary hover:bg-primary/10 dark:hover:bg-slate-800 transition-all"
            title="Help"
          >
            <Question size={18} weight="duotone" />
          </button>
          <div ref={bellRef}><NotificationsMenu showNotifications={showNotifications} setShowNotifications={setShowNotifications} /></div>
          <div ref={profileRef}><UserMenu session={session} showProfile={showProfile} setShowProfile={setShowProfile} getInitials={getInitials} /></div>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="hidden lg:flex border-t border-standard dark:border-slate-800 bg-card/40 dark:bg-[#0F172A]/40 backdrop-blur-md h-[54px] px-8 border-b">
        <nav className="flex items-center justify-center gap-3 w-full max-w-7xl mx-auto h-full">
          {filteredNavItems.map((item) => {
            const active = checkActive(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path} prefetch={true} scroll={false} className={`group flex items-center gap-2 px-3.5 py-2 transition-all whitespace-nowrap outline-none ${active ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-secondary dark:text-muted font-semibold hover:bg-bg-main dark:hover:bg-slate-800/60 hover:text-main dark:hover:text-white'}`}>
                <Icon size={16} className={active ? 'text-primary' : 'text-muted dark:text-slate-500 group-hover:text-secondary dark:group-hover:text-white'} />
                <span className="text-[13px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[100%] left-0 w-full bg-card border-b border-standard dark:border-slate-800 z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-4 space-y-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2">Menu</p>
            {filteredNavItems.map((item) => {
              const active = checkActive(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.path} prefetch={true} scroll={false} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 transition-all ${active ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-secondary dark:text-slate-300 hover:bg-bg-main dark:hover:bg-slate-800'}`}>
                  <Icon size={18} className={active ? 'text-primary' : 'text-muted dark:text-slate-500'} /><span className="text-[14px] font-semibold">{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowHelp(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all text-secondary dark:text-slate-300 hover:bg-bg-main dark:hover:bg-slate-800"
            >
              <Question size={18} className="text-muted" weight="duotone" />
              <span className="text-[14px] font-semibold">Help</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
