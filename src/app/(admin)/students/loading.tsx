import React from 'react';
import { HeaderSkeleton, FilterPanelSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <FilterPanelSkeleton />
      <TableAreaSkeleton />
    </div>
  );
}
