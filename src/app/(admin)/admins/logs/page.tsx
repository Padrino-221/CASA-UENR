'use client';

import React from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLogHeader } from '@/components/logs/AuditLogHeader';
import { AuditLogTable } from '@/components/logs/AuditLogTable';

import { HeaderSkeleton, TableAreaSkeleton } from '@/components/ui/Skeleton';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const take = 15;
  const { logs, total, loading, skip, setSkip } = useAuditLogs(take);

  if (status === 'loading') {
    return (
      <div className="space-y-8 w-full stagger-fade-in">
        <HeaderSkeleton />
        <TableAreaSkeleton />
      </div>
    );
  }

  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    redirect('/');
  }

  return (
    <div className="space-y-8 w-full">
      <AuditLogHeader logs={logs} />

      <AuditLogTable 
        logs={logs} 
        loading={loading} 
        take={take} 
        skip={skip}
        total={total}
        onPrev={() => setSkip(Math.max(0, skip - take))}
        onNext={() => setSkip(skip + take)}
      />
    </div>
  );
}
