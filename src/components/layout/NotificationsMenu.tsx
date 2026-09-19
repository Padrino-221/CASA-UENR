import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Wallet,
  CalendarBlank,
  CheckCircle,
  X
} from '@phosphor-icons/react';

import Link from 'next/link';

interface NotificationsMenuProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

interface NotificationItem {
  id: string;
  type: 'FINANCE' | 'CALENDAR' | string;
  title: string;
  subtitle: string;
  time: string;
  url: string;
}

export const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ showNotifications, setShowNotifications }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load dismissed IDs after mount — reading localStorage during render causes
  // server/client hydration mismatches.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('uchms_dismissed_notifications');
      if (saved) setDismissedIds(JSON.parse(saved));
    } catch {
      // corrupted storage — start fresh
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        const saved = localStorage.getItem('uchms_dismissed_notifications');
        const dismissed = saved ? JSON.parse(saved) : [];
        const active = data.filter((n: NotificationItem) => !dismissed.includes(n.id));
        setNotifications(active);
      }
    } catch {
      console.error('Failed to fetch notifications');
    }
  };

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem('uchms_dismissed_notifications', JSON.stringify(updated));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = [...dismissedIds, ...allIds];
    setDismissedIds(updated);
    localStorage.setItem('uchms_dismissed_notifications', JSON.stringify(updated));
    setNotifications([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, setShowNotifications]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => {
          const newState = !showNotifications;
          setShowNotifications(newState);
          if (newState) fetchNotifications();
        }}
        className={`relative flex items-center justify-center w-8.5 h-8.5 border transition-all duration-300 ${
          showNotifications 
            ? 'bg-white border-[#1E67FC]/20 text-[#1E67FC]' 
            : 'bg-transparent border-transparent text-[#94A3B8] hover:text-[#1E67FC] hover:bg-[#EBF2FF]'
        }`}
      >
        <Bell size={16} weight="duotone" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center border-2 border-white leading-none animate-in scale-in duration-200">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="fixed sm:absolute top-[76px] sm:top-[calc(100%+8px)] inset-x-4 sm:left-auto sm:right-0 sm:w-[320px] bg-white/95 backdrop-blur-md border border-slate-100 p-3.5 z-[1001] animate-flow ring-1 ring-black/5">
          <div className="p-2 mb-2 flex items-center justify-between border-b border-slate-100/80">
            <span className="text-[13px] font-extrabold text-[#0F172A] tracking-tight">Activity Log</span>
            <button 
              onClick={handleClearAll}
              className="text-[9px] font-extrabold text-[#1E67FC] uppercase tracking-widest cursor-pointer px-2 py-1 hover:bg-[#EBF2FF] transition-colors outline-none"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-[280px] overflow-y-auto space-y-1.5 custom-scrollbar no-scrollbar">
            {notifications.length > 0 ? notifications.map((n) => (
              <div 
                key={n.id}
                className="relative group/item flex items-center w-full"
              >
                <Link 
                  href={n.url}
                  onClick={() => setShowNotifications(false)}
                  className="flex-grow text-left p-2.5 pr-8 hover:bg-[#F4F7FC] transition-all flex gap-3 group border border-transparent hover:border-slate-100"
                >
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    n.type === 'FINANCE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#1E67FC]/10 text-[#1E67FC]'
                  }`}>
                    {n.type === 'FINANCE' ? <Wallet size={14} weight="duotone" /> : <CalendarBlank size={14} weight="duotone" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="block text-[12px] font-bold text-[#0F172A] tracking-tight leading-none mb-1 group-hover:text-[#1E67FC] transition-colors">{n.title}</span>
                    <span className="block text-[10px] font-medium text-[#475569] line-clamp-1 mb-1">{n.subtitle}</span>
                    <span className="block text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">{new Date(n.time).toLocaleDateString()}</span>
                  </div>
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDismiss(n.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all z-10"
                  title="Dismiss notification"
                >
                  <X size={11} weight="duotone" />
                </button>
              </div>
            )) : (
              <div className="p-8 text-center space-y-2">
                 <CheckCircle size={24} className="mx-auto text-[#1E67FC]/20 animate-pulse" weight="duotone" />
                 <p className="text-[11px] font-bold text-[#94A3B8]">Your network is operational with no recent alerts.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
