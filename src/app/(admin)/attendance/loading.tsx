import React from 'react';
import { HeaderSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <HeaderSkeleton />
      <TableAreaSkeleton />
    </div>
  );
}
