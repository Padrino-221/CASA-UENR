import React from 'react';
import Link from 'next/link';
import {
  User,
  SignOut,
  CaretDown
} from '@phosphor-icons/react';

import { signOut } from 'next-auth/react';
import { formatRoleLabel } from '@/lib/utils';

interface UserMenuProps {
  session: { user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } } | null;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  getInitials: (name?: string | null, email?: string | null) => string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ session, showProfile, setShowProfile, getInitials }) => {
  const handleSignOut = () => signOut({ callbackUrl: '/login' });

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className={`flex items-center gap-2 p-0.5 border transition-all duration-300 ${showProfile ? 'bg-white border-[#1E67FC]/20' : 'bg-transparent border-transparent hover:bg-[#F4F7FC]'}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E67FC] to-[#1E67FC] text-white flex items-center justify-center font-bold text-[11px]">
          {getInitials(session?.user?.name, session?.user?.email)}
        </div>
        <CaretDown size={12} className={`text-[#94A3B8] hidden sm:block mr-1 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} weight="duotone" />
      </button>

      {showProfile && (
        <div className="fixed sm:absolute top-[64px] sm:top-[calc(100%+6px)] inset-x-4 sm:left-auto sm:right-0 sm:w-[220px] bg-white border border-[#E2E8F0] p-1 z-[1001] animate-flow">
          <div className="px-2.5 py-2 border-b border-[#E2E8F0] mb-1">
            <p className="text-[13px] font-bold text-[#0F172A] truncate">{session?.user?.name || session?.user?.email || 'Authorized User'}</p>
            <p className="text-[10px] font-bold text-[#1E67FC] uppercase tracking-wider">{formatRoleLabel(session?.user?.role)} Role</p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2.5 w-full p-2 hover:bg-[#F4F7FC] transition-colors text-[#475569] mt-1"
            onClick={() => setShowProfile(false)}
          >
            <User size={14} weight="duotone" />
            <span className="text-[12px] font-semibold">My Profile</span>
          </Link>
          <div className="h-px bg-[#E2E8F0] my-1" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full p-2 hover:bg-rose-50 text-rose-600 transition-colors"
          >
            <SignOut size={14} weight="duotone" />
            <span className="text-[12px] font-bold">Exit Portal</span>
          </button>
        </div>
      )}
    </div>
  );
};
