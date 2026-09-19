'use client';

import React from 'react';
import {
  SquaresFour, MapTrifold, Buildings, UsersThree, CheckSquare,
  CalendarBlank, ClockCounterClockwise, Wallet, FileText, SignOut, ShieldCheck, X, PaintBrush
} from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRoleLabel } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = React.memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const getDashboardPath = () => {
    if (role === 'REGIONAL_ADMIN') return '/regional';
    if (role === 'LOCAL_ADMIN') return '/local';
    if (role === 'CONTENT_MANAGER') return '/content';
    return '/dashboard';
  };

  const dashboardPath = getDashboardPath();

  const navItems = [
    { name: 'Dashboard', icon: SquaresFour, path: dashboardPath, roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Regions', icon: MapTrifold, path: '/regions', roles: ['NATIONAL_ADMIN'] },
    { name: 'Chapters', icon: Buildings, path: '/chapters', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN'] },
    { name: 'Members', icon: UsersThree, path: '/students', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Attendance', icon: CheckSquare, path: '/attendance', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Events', icon: CalendarBlank, path: '/events', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Calendar', icon: ClockCounterClockwise, path: '/calendar', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Finance', icon: Wallet, path: '/collections', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN', 'LOCAL_ADMIN'] },
    { name: 'Snapshot', icon: FileText, path: '/reports', roles: ['NATIONAL_ADMIN', 'REGIONAL_ADMIN'] },
    { name: 'Activity Logs', icon: ClockCounterClockwise, path: '/admins/logs', roles: ['NATIONAL_ADMIN'] },
    { name: 'Admins', icon: ShieldCheck, path: '/admins', roles: ['NATIONAL_ADMIN'] },
    { name: 'Website CMS', icon: PaintBrush, path: '/content', roles: ['CONTENT_MANAGER', 'NATIONAL_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => role ? item.roles.includes(role) : false);

  const hasMoreSpecificMatch = (itemPath: string) => {
    return navItems.some((other) => other.path !== itemPath && pathname?.startsWith(other.path) && other.path.length > itemPath.length);
  };

  const checkActive = (path: string) => {
    if (!pathname) return false;
    if (pathname === path) return true;
    if (pathname.startsWith(path + '/')) {
      return !hasMoreSpecificMatch(path);
    }
    return false;
  };

  const handleSignOut = () => signOut({ callbackUrl: '/login' });

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Scaled Down to w-64 */}
      <aside
        suppressHydrationWarning
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-primary border-r border-white/10 transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-[64px] px-5 border-b border-white/10 lg:h-[88px] lg:pt-6 lg:pb-2">
          <Link href={dashboardPath} className="flex items-center gap-3" onClick={onClose} scroll={false}>
            <div className="w-14 h-14 overflow-hidden">
              <Image src="/casa-logo-white.png" alt="CASA UENR logo" width={56} height={56} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-white text-[16px] font-bold tracking-tight leading-none whitespace-nowrap">CASA UENR</h2>
              <p className="text-blue-200 text-[9px] uppercase font-bold tracking-[0.1em] mt-1">{formatRoleLabel(role)}</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 bg-white/10 border border-white/20 text-white/70 lg:hidden"
          >
            <X size={14} weight="duotone" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <nav suppressHydrationWarning className="flex-1 px-3 py-4 flex flex-col justify-start space-y-1 overflow-y-auto no-scrollbar">
          {filteredNavItems.map((item) => {
            const active = checkActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                prefetch={true}
                scroll={false}
                className={`group flex items-center gap-2.5 px-3 h-10 w-full transition-all outline-none font-bold text-[13px] ${active
                  ? 'bg-white text-primary'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon
                  size={18}
                  weight="duotone"
                  className={active ? 'text-primary' : 'text-white/50 group-hover:text-white'}
                />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Log Out - Scaled paddings */}
        <div className="p-3 border-t border-white/10 bg-transparent lg:pb-6">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 h-10 text-white/60 hover:text-red-300 hover:bg-white/10 transition-all font-bold text-[13px]"
          >
            <SignOut size={18} weight="duotone" className="text-white/40 group-hover:text-red-300" />
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
