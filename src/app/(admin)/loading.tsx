import React from 'react';
import { 
  HeaderSkeleton, 
  MetricCardSkeleton, 
  ChartSectionSkeleton, 
  PromoCardSkeleton, 
  TimelineSkeleton, 
  TableAreaSkeleton 
} from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Main Charts & Promos Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <ChartSectionSkeleton />
        </div>
        <div className="lg:col-span-4">
          <PromoCardSkeleton />
        </div>
      </div>

      {/* Bottom Activities & Transaction Ledger Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <TimelineSkeleton />
        </div>
        <div className="lg:col-span-7">
          <TableAreaSkeleton />
        </div>
      </div>
    </div>
  );
}
