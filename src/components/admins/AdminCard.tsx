'use client';

import {
  Shield,
  Pencil,
  Trash
} from '@phosphor-icons/react';

import { formatRoleLabel } from '@/lib/utils';

type AdminCardProps = {
    user: {
      name: string;
      email: string;
      role: string;
      region?: { name: string } | null;
      chapter?: { name: string } | null;
    };
    isNational: boolean;
    onEdit: (user: Record<string, unknown>) => void;
    onDelete: (user: Record<string, unknown>) => void;
};

export default function AdminCard({ user, isNational, onEdit, onDelete }: AdminCardProps) {
    const regionName = user.region?.name || (user.role === 'NATIONAL_ADMIN' ? 'National' : 'Unassigned');
    const chapterName = user.chapter?.name;

    return (
        <div className="rounded-xl group bg-white border border-slate-200 p-4 sm:p-6 hover:border-[#1D4ED8]/20 transition-all relative">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200 shrink-0  transition-transform">
                        <Shield size={22} className={user.role === 'NATIONAL_ADMIN' ? 'text-amber-500' : 'text-[#1D4ED8]'} weight="duotone" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] tracking-tight truncate">{user.name}</h3>
                            <span className="inline-flex items-center text-[13px] font-semibold normal-case tracking-normal text-slate-500 bg-slate-50 px-2.5 py-1 border border-slate-200 shrink-0">
                                {formatRoleLabel(user.role)}
                            </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-500 truncate">{user.email}</p>
                        <div className="mt-4 grid gap-2 text-[13px] normal-case tracking-normal text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-500">Region:</span>
                                <span className="text-[#0F172A] font-semibold truncate">{regionName}</span>
                            </div>
                            {chapterName && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-500">Chapter:</span>
                                    <span className="text-[#0F172A] font-semibold truncate">{chapterName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isNational && (
                    <div className="flex gap-1.5 shrink-0">
                        <button aria-label="Edit record"
                            onClick={() => onEdit(user)}
                            className="w-8 h-8 bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-[#EBF2FF] hover:text-[#1D4ED8] transition-all border border-slate-200"
                        >
                            <Pencil size={13} weight="duotone" />
                        </button>
                        <button aria-label="Delete record"
                            onClick={() => onDelete(user)}
                            className="w-8 h-8 bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                        >
                            <Trash size={13} weight="duotone" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
