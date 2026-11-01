"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus
} from '@phosphor-icons/react';

import { RegionAddModal } from '@/components/regions/RegionAddModal';
import { useRegions } from '@/hooks/useRegions';
import { useSession } from 'next-auth/react';

export default function RegionPromoCTA() {
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const isNational = userRole === 'NATIONAL_ADMIN';
    const { createRegion, isSubmitting } = useRegions();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newRegion, setNewRegion] = useState({ name: '', adminName: '', adminEmail: '', adminPassword: '' });

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (await createRegion(newRegion)) {
            setShowAddModal(false);
            setNewRegion({ name: '', adminName: '', adminEmail: '', adminPassword: '' });
        }
    };

    return (
        <div className="admin-quick-action lg:col-span-4 bg-[#1D4ED8] p-4 sm:p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden group min-h-[260px] sm:min-h-[360px] transition-all duration-500 border border-white/5">

            <div className="relative z-10 flex-1">
                <span className="text-[13px] font-semibold bg-white/12 border border-white/15 backdrop-blur-md px-3.5 py-1.5 normal-case tracking-normal !text-white block w-fit">
                    Regions
                </span>
                <h4 className="text-[22px] font-semibold mt-6 leading-[1.25] !text-white tracking-tight">
                    Create a new region and assign its admin
                </h4>
                <p className="text-sm !text-[#EBF2FF]/90 mt-3 leading-relaxed font-medium">
                    Add a region and assign an administrator to support its chapters.
                </p>
            </div>

            {isNational ? (
                <button onClick={() => setShowAddModal(true)} className="relative z-10 w-fit bg-white text-[#1D4ED8] font-semibold text-[13px] normal-case tracking-normal py-3.5 px-6 hover:bg-slate-50 transition-all active:scale-[0.98] mt-6 flex items-center gap-2 group/btn">
                    <Plus size={16} weight="duotone" />
                    <span>Add Region</span>
                </button>
            ) : (
                <Link href="/regions" className="relative z-10 w-fit bg-white text-[#1D4ED8] font-semibold text-[13px] normal-case tracking-normal py-3.5 px-6 hover:bg-slate-50 transition-all active:scale-[0.98] mt-6 flex items-center gap-2 group/btn">
                    <span>View Regions</span>
                </Link>
            )}

            <RegionAddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleCreateSubmit} newRegion={newRegion} setNewRegion={setNewRegion} isSubmitting={isSubmitting} />
        </div>
    );
}
