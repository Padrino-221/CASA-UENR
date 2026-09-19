import React from 'react';
import { HeaderSkeleton, MetricCardSkeleton, ChartSectionSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ChartSectionSkeleton />
        </div>
        <div className="lg:col-span-4">
          <ChartSectionSkeleton />
        </div>
      </div>
    </div>
  );
}
