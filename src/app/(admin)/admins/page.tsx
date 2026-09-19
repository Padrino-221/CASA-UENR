import React from 'react';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminList from '@/components/admins/AdminList';

export default async function AdminManagement() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session || (role !== 'NATIONAL_ADMIN' && role !== 'REGIONAL_ADMIN' && role !== 'LOCAL_ADMIN')) {
    redirect('/');
  }

  // Local admins only manage chapter-scoped sub-accounts (Finance / Secretary).
  const where =
    role === 'LOCAL_ADMIN'
      ? { chapterId: session.user?.chapterId ?? 'none', role: { in: ['FINANCE', 'SECRETARY'] } }
      : {};

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      region: { select: { name: true } },
      chapter: { select: { name: true } }
    }
  });

  const isLocal = role === 'LOCAL_ADMIN';

  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">
              {isLocal ? 'Sub-accounts' : 'Admins'}
            </h1>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">
              {isLocal ? 'Task accounts for your chapter' : 'Admin Accounts'}
            </p>
          </div>
        </div>
      </header>

      <AdminList initialUsers={users} viewerRole={role} />
    </div>
  );
}
