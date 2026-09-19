import React from 'react';
import {
  Globe,
  Pencil,
  Trash,
  Buildings,
  Users,
  CaretRight
} from '@phosphor-icons/react';

import Link from 'next/link';
import { Region } from '@/types/models';

interface RegionCardProps {
  region: Region;
  userRole: string | undefined;
  onEdit: (region: Region) => void;
  onDelete: (id: string) => void;
}

export const RegionCard: React.FC<RegionCardProps> = ({ region, userRole, onEdit, onDelete }) => {
  return (
    <div className="card-flow p-8 group !">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 bg-[#EBF2FF] text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            <Globe size={28} weight="duotone" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userRole === 'NATIONAL_ADMIN' && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all mr-2">
              <button 
                onClick={() => onEdit(region)} 
                className="w-10 h-10 bg-card border border-standard text-muted hover:text-main flex items-center justify-center transition-colors"
              >
                <Pencil size={16} weight="duotone" />
              </button>
              <button 
                onClick={() => onDelete(region.id)} 
                className="w-10 h-10 bg-card border border-standard text-muted hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <Trash size={16} weight="duotone" />
              </button>
            </div>
          )}
          <div className="text-[10px] font-black uppercase tracking-[0.15em] text-primary bg-[#EBF2FF] px-3 py-1.5">
             Active
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-2xl font-black text-main tracking-tighter leading-none mb-2">{region.name}</h3>
        <p className="text-sm text-slate-500 font-bold opacity-70 uppercase tracking-wide text-[10px]">Region</p>
      </div>

      <div className="flex gap-6 py-4 border-t border-slate-100">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-main flex items-center justify-center text-muted">
              <Buildings size={16} weight="duotone" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-extrabold text-main leading-none">{region._count?.chapters || 0}</span>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider mt-1">Chapters</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-main flex items-center justify-center text-muted">
              <Users size={16} weight="duotone" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-extrabold text-main leading-none">{region._count?.students || 0}</span>
               <span className="text-[10px] uppercase font-bold text-muted tracking-wider mt-1">Members</span>
            </div>
         </div>
      </div>

      <Link href={`/chapters?regionId=${region.id}`} className="w-full flex items-center justify-center gap-2 py-4 bg-[#F4F7FC] hover:bg-card text-primary hover:text-[#0F53D6] font-black text-xs uppercase tracking-widest transition-all border border-standard hover:border-[#1E67FC]/30 group/btn">
         <span>Enter Region</span>
         <CaretRight size={18} className="group-hover/btn:translate-x-1 transition-transform" weight="duotone" />
      </Link>
    </div>
  );
};
