'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MagnifyingGlass,
  List,
  Question,
  User,
  SpinnerGap,
  Building,
  MapPin as MapIcon
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import { UserMenu } from './layout/UserMenu';
import { NotificationsMenu } from './layout/NotificationsMenu';
import HelpModal from './HelpModal';
import { useSearch } from '@/hooks/useSearch';

interface TopHeaderProps {
  onMenuToggle: () => void;
}

export default function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    loading,
    showResults,
    setShowResults,
    navigateToResult
  } = useSearch();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowResults]);

  const handleSearchInput = (value: string) => {
    setQuery(value);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  return (
    <header className="relative z-30 h-[64px] bg-white/80 border-b border-slate-100/50 flex items-center justify-between px-4 md:px-6 shrink-0 transition-all duration-300 lg:h-[88px] lg:pt-6 lg:pb-2 lg:bg-transparent lg:border-none">

      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex items-center justify-center w-8.5 h-8.5 bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100"
        >
          <List size={16} weight="duotone" />
        </button>

        <div className="relative w-[180px] sm:w-[280px] md:w-[380px] lg:w-[480px] transition-all duration-300" ref={searchRef}>
          <div className="group flex items-center bg-[#F4F7FC] px-3 w-full border border-[#E2E8F0] focus-within:border-[#1E67FC]/30 focus-within:bg-white transition-all duration-300">
            {loading ? <SpinnerGap size={14} className="text-[#94A3B8] animate-spin" weight="duotone" /> : <MagnifyingGlass size={14} className="text-[#94A3B8]" weight="duotone" />}
            <input
              type="text"
              placeholder="Search members, chapters..."
              className="border-none bg-transparent py-2 px-2.5 text-[12px] text-[#0F172A] w-full font-bold outline-none placeholder:text-[#94A3B8]"
              value={query}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => query.length >= 2 && setShowResults(true)}
            />
          </div>

          {showResults && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#E2E8F0] p-1.5 z-[1001] animate-flow">
              {results.length > 0 ? results.map((result, idx) => (
                <button
                  key={idx}
                  className="flex items-center w-full p-2 gap-3 hover:bg-[#F4F7FC] transition-colors text-left"
                  onClick={() => {
                    navigateToResult(result.url);
                    setShowResults(false);
                  }}
                >
                  <div className="w-7 h-7 bg-[#EBF2FF] text-[#1E67FC] flex items-center justify-center shrink-0">
                    {result.type === 'Member' ? <User size={13} weight="duotone" /> : result.type === 'Branch' ? <Building size={13} weight="duotone" /> : <MapIcon size={13} weight="duotone" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="block text-[12px] font-bold text-[#0F172A] truncate">{result.title}</span>
                    <span className="block text-[10px] font-medium text-[#94A3B8] truncate">{result.subtitle}</span>
                  </div>
                </button>
              )) : <div className="p-3 text-center text-[11px] font-bold text-[#94A3B8]">No results found.</div>}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center justify-center w-8.5 h-8.5 text-[#94A3B8] hover:text-[#1E67FC] hover:bg-[#EBF2FF] transition-all"
          title="Help"
        >
          <Question size={16} weight="duotone" />
        </button>

        <div ref={bellRef} className="relative">
          <NotificationsMenu
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
          />
        </div>

        <div ref={profileRef}>
          <UserMenu
            session={session}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            getInitials={getInitials}
          />
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </header>
  );
}
