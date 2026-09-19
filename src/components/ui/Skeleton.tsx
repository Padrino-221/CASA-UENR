'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-100/80 ${className}`} style={style}></div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-8 ! border border-black/5 bg-white flex flex-col justify-between h-[180px]">
      <div className="flex justify-between items-start">
        {/* Glowing Halo Icon Spacer */}
        <div className="w-14 h-14 bg-slate-50/50 flex items-center justify-center border border-black/5">
          <Skeleton className="w-8 h-8" />
        </div>
        <Skeleton className="w-20 h-6 opacity-60" />
      </div>
      <div>
        <Skeleton className="w-28 h-3.5 mb-2.5 opacity-50" />
        <Skeleton className="w-40 h-8" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card table-card overflow-hidden ! border border-black/5 bg-white">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50/50 p-6 border-b border-black/5 flex items-center justify-between">
        <Skeleton className="w-48 h-5" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-20 h-5" />
        </div>
      </div>
      
      {/* Table Rows Skeleton */}
      <div className="divide-y divide-black/5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 flex items-center justify-between gap-6 hover:bg-slate-50/20 transition-colors">
            {/* Avatar & Member profile info */}
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-10 h-10" />
              <div className="space-y-2">
                <Skeleton className="w-36 h-4" />
                <Skeleton className="w-20 h-2.5 opacity-40" />
              </div>
            </div>
            
            {/* Table Column Placeholders */}
            <div className="flex items-center gap-8 flex-1 justify-end">
              <Skeleton className="w-24 h-4 hidden sm:block opacity-65" />
              <Skeleton className="w-20 h-4 hidden md:block opacity-50" />
              <Skeleton className="w-24 h-6" />
              
              {/* Actions controls placeholder */}
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="card-premium p-5 !flex-row !items-center gap-4 animate-pulse">
      {/* Left Column: Icon Spacer */}
      <div className="w-16 h-16 bg-slate-100 flex items-center justify-center shrink-0 border border-black/5">
        <Skeleton className="w-7 h-7" />
      </div>

      {/* Right Column: Label & Value */}
      <div className="flex flex-col min-w-0 space-y-2 flex-1">
        <Skeleton className="w-20 h-2.5 opacity-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-32 h-7" />
          <Skeleton className="w-12 h-4 opacity-30" />
        </div>
      </div>
    </div>
  );
}

export function ChartSectionSkeleton() {
  return (
    <div className="card-premium p-6 flex flex-col justify-between h-full animate-pulse min-h-[360px]">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <Skeleton className="w-40 h-3 opacity-40" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-24 h-3 opacity-30" />
          </div>
        </div>
      </div>
      <div className="flex-1 mt-2 flex items-end gap-3 px-4">
        {[...Array(12)].map((_, i) => {
          // Use deterministic heights based on index to avoid hydration mismatch
          const height = [45, 62, 38, 75, 50, 85, 40, 68, 55, 92, 48, 70][i % 12];
          return (
            <Skeleton 
              key={i} 
              className="flex-1" 
              style={{ height: `${height}%`, opacity: 0.1 + (i * 0.05) }} 
            />
          );
        })}
      </div>
    </div>
  );
}

export function PromoCardSkeleton() {
  return (
    <div className=" bg-slate-100 p-8 flex flex-col justify-between h-full animate-pulse min-h-[360px] relative overflow-hidden">
      <div className="relative z-10 space-y-6">
        <Skeleton className="w-24 h-6 opacity-40" />
        <div className="space-y-3">
          <Skeleton className="w-full h-7 opacity-50" />
          <Skeleton className="w-3/4 h-7 opacity-50" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-3 opacity-30" />
          <Skeleton className="w-5/6 h-3 opacity-30" />
        </div>
      </div>
      <Skeleton className="w-40 h-11 opacity-40 relative z-10 mt-8" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="card-premium p-6 animate-pulse h-full">
      <div className="flex justify-between items-center mb-5">
        <div className="space-y-2">
          <Skeleton className="w-28 h-2.5 opacity-40" />
          <Skeleton className="w-36 h-5" />
        </div>
        <Skeleton className="w-24 h-8 opacity-30" />
      </div>

      <div className="space-y-4 pt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-3">
            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-full h-3 opacity-50" />
              <Skeleton className="w-32 h-2.5 opacity-30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableAreaSkeleton() {
  return (
    <div className="card-premium overflow-hidden !p-0 animate-pulse h-full">
      <div className="p-5 border-b border-black/5 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-32 h-2.5 opacity-40" />
          <Skeleton className="w-40 h-5" />
        </div>
        <Skeleton className="w-28 h-9 opacity-30" />
      </div>
      <div className="p-5 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
            <Skeleton className="w-24 h-5 opacity-60" />
            <Skeleton className="w-32 h-4 opacity-40" />
            <Skeleton className="w-40 h-4 opacity-40 hidden md:block" />
            <Skeleton className="w-24 h-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilterPanelSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 mb-6 animate-pulse">
      <div className="w-full md:w-[320px]">
        <Skeleton className="w-full h-12" />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <Skeleton className="w-full md:w-[180px] h-12 opacity-60" />
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="premium-header !mb-0 !pb-6 animate-pulse">
      <div className="header-content-root flex justify-between items-center w-full">
        <div className="space-y-3">
          <Skeleton className="w-64 h-10" />
          <Skeleton className="w-48 h-4 opacity-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-32 h-11 opacity-60" />
          <Skeleton className="w-36 h-11" />
        </div>
      </div>
    </header>
  );
}
