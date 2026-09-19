'use client';

import React from 'react';
import Portal from './Portal';

export default function LoadingOverlay() {
  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-card/20 backdrop-blur-[48px] animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-[#1E67FC] rounded-full animate-spin"></div>
      </div>
    </Portal>
  );
}
