'use client';

import React, { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import GuidanceModal from '@/components/GuidanceModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleClose = useCallback(() => setSidebarOpen(false), []);
  const handleToggle = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <div className="flex h-screen w-full bg-[#F4F7FC] relative overflow-hidden">
      {/* Decorative Ambient Glassmorphism Blobs - Soft, elegant, and low opacity */}
      <div className="absolute top-[5%] left-[10%] w-[30rem] h-[30rem] rounded-full bg-indigo-200/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[5%] w-[35rem] h-[35rem] rounded-full bg-sky-200/20 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] rounded-full bg-pink-100/10 blur-[110px] pointer-events-none -z-10" />

      {/* Left Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleClose} />

      {/* Right Content Pane */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Horizontal Navigation bar */}
        <div className="pt-3 lg:pt-0">
          <TopHeader onMenuToggle={handleToggle} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          <div className="w-full animate-flow">
            {children}
          </div>
        </main>
      </div>

      {/* Guidance modal */}
      <GuidanceModal />
    </div>
  );
}
