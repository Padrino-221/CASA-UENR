import React from 'react';
import { HeaderSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="h-[500px] bg-slate-50/50 border border-black/5 animate-pulse" />
        </div>
        <div className="lg:col-span-5">
          <div className="h-[600px] bg-slate-50/50 border border-black/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
