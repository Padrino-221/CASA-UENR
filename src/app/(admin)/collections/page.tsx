import React, { Suspense } from 'react';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CollectionList from '@/components/collections/CollectionList';
import { HeaderSkeleton, MetricCardSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';
import { Transaction } from '@/types/models';

function CollectionsLoadingSkeleton() {
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

export default async function CollectionsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const role = session.user?.role;
  const regionId = session.user?.regionId ?? undefined;
  const chapterId = session.user?.chapterId ?? undefined;

  // Build prisma where clause
  const where: Record<string, unknown> = {};
  if (role === 'REGIONAL_ADMIN' && regionId) {
    where.chapter = { regionId };
  } else if (role === 'LOCAL_ADMIN' && chapterId) {
    where.chapterId = chapterId;
  }

  // Fetch metrics data directly on the server
  const [transactions, institutions, members] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        chapter: true,
        student: true
      },
      orderBy: { date: 'desc' }
    }),
    db.chapter.findMany({
      where: role === 'REGIONAL_ADMIN' ? { regionId } : (role === 'LOCAL_ADMIN' ? { id: chapterId } : {}),
      select: { id: true, name: true }
    }),
    db.student.findMany({
      where: role === 'REGIONAL_ADMIN' ? { chapter: { regionId } } : (role === 'LOCAL_ADMIN' ? { chapterId: chapterId } : {}),
      select: { id: true, name: true, studentId: true }
    })
  ]);

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto stagger-fade-in">
      <Suspense fallback={<CollectionsLoadingSkeleton />}>
        <CollectionList 
          initialCollections={transactions as unknown as Transaction[]} 
          chapters={institutions} 
          members={members} 
          role={role || 'NATIONAL_ADMIN'} 
        />
      </Suspense>
    </div>
  );
}
