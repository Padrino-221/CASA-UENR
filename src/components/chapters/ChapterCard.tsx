import React from 'react';
import {
  Buildings,
  MapPin,
  Shield,
  Pencil,
  Trash,
  ArrowRight
} from '@phosphor-icons/react';

import Link from 'next/link';
import { Chapter } from '@/types/models';

interface ChapterCardProps {
  ch: Chapter;
  role: string | undefined;
  onEdit: (ch: Chapter) => void;
  onDelete: (id: string) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ ch, role, onEdit, onDelete }) => {
  return (
    <div className="card-flow p-8 group !">
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-indigo-50 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
          <Buildings size={28} weight="duotone" />
        </div>
        
        <div className="flex items-center gap-2">
          {role === 'REGIONAL_ADMIN' && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all mr-2">
              <button 
                onClick={() => onEdit(ch)} 
                className="w-8 h-8 bg-card border border-standard text-muted hover:text-main flex items-center justify-center transition-colors"
              >
                <Pencil size={14} weight="duotone" />
              </button>
              <button 
                onClick={() => onDelete(ch.id)} 
                className="w-8 h-8 bg-card border border-standard text-muted hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <Trash size={14} weight="duotone" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] font-black text-primary tracking-[0.15em] bg-indigo-50 px-3 py-1.5 uppercase">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            Active
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-2xl font-black text-main tracking-tighter leading-tight mb-3">{ch.name}</h3>
        <div className="flex flex-wrap gap-4">
           <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <MapPin size={14} className="text-primary" weight="duotone" />
              <span>{ch.region.name}</span>
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <Shield size={14} className="text-[#1E67FC]" weight="duotone" />
              <span>{ch.university}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 bg-card/40 border border-white/20 overflow-hidden mb-8 divide-x divide-white/20">
         <div className="bg-bg-main/20 p-6 pl-8 flex flex-col">
            <span className="text-[10px] uppercase font-black text-muted tracking-[0.2em] mb-1">Members</span>
            <span className="text-2xl font-black text-main">{ch._count?.students || 0}</span>
         </div>
         <div className="bg-bg-main/20 p-6 pl-8 flex flex-col">
            <span className="text-[10px] uppercase font-black text-muted tracking-[0.2em] mb-1">Records</span>
            <span className="text-2xl font-black text-main">{ch._count?.collections || 0}</span>
         </div>
      </div>

      <Link href={`/collections?chapterId=${ch.id}`} className="btn-lux-primary w-full justify-center group/btn">
         <span>Operational Dashboard</span>
         <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" weight="duotone" />
      </Link>
    </div>
  );
};
