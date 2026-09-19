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
        <div className="lg:col-span-4 bg-[#1E67FC] p-4 sm:p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden group min-h-[260px] sm:min-h-[360px] transition-all duration-500 border border-white/5">

            <div className="absolute -bottom-16 -right-16 w-[340px] h-[340px] rounded-full bg-[#1358E2] pointer-events-none transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute -bottom-28 -right-20 w-[300px] h-[300px] rounded-full bg-[#38BDF8] pointer-events-none transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-105" />
            <div className="absolute -bottom-40 -right-24 w-[260px] h-[260px] rounded-full bg-[#00D2FF] pointer-events-none transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105" />

            <div className="relative z-10 flex-1">
                <span className="text-[9px] font-black bg-white/12 border border-white/15 backdrop-blur-md px-3.5 py-1.5 uppercase tracking-widest !text-white block w-fit">
                    Regions
                </span>
                <h4 className="text-[22px] font-extrabold mt-6 leading-[1.25] !text-white tracking-tight">
                    Create a new region and assign its admin
                </h4>
                <p className="text-[12px] !text-[#EBF2FF]/90 mt-3 leading-relaxed font-medium">
                    Provision regional jurisdictions and onboard their primary administrator for centralized management.
                </p>
            </div>

            {isNational ? (
                <button onClick={() => setShowAddModal(true)} className="relative z-10 w-fit bg-white text-[#1E67FC] font-extrabold text-[11px] uppercase tracking-widest py-3.5 px-6 hover:bg-slate-50 transition-all active:scale-[0.98] mt-6 flex items-center gap-2 group/btn">
                    <Plus size={16} weight="duotone" />
                    <span>Add Region</span>
                </button>
            ) : (
                <Link href="/regions" className="relative z-10 w-fit bg-white text-[#1E67FC] font-extrabold text-[11px] uppercase tracking-widest py-3.5 px-6 hover:bg-slate-50 transition-all active:scale-[0.98] mt-6 flex items-center gap-2 group/btn">
                    <span>View Regions</span>
                </Link>
            )}

            <RegionAddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleCreateSubmit} newRegion={newRegion} setNewRegion={setNewRegion} isSubmitting={isSubmitting} />
        </div>
    );
}
