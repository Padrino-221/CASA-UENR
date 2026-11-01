'use client';
import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import GuidanceModal from '@/components/GuidanceModal';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(open => !open), []);
  return <div className="admin-workspace">
    <Sidebar isOpen={sidebarOpen} onClose={closeSidebar}/>
    <div className="admin-content-pane">
      <TopHeader onMenuToggle={toggleSidebar}/>
      <main className="admin-main" id="admin-main"><div className="admin-page">{children}</div></main>
    </div>
    <GuidanceModal/>
  </div>;
}
