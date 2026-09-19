import React from 'react';
import { HeaderSkeleton, MetricCardSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <TableAreaSkeleton />
    </div>
  );
}
