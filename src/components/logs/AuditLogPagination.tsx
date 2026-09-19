import React from 'react';
import {
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';


interface AuditLogPaginationProps {
  skip: number;
  take: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export const AuditLogPagination: React.FC<AuditLogPaginationProps> = ({ skip, take, total, onPrev, onNext }) => {
  return (
    <div className="flex justify-between items-center bg-card border border-standard p-4 px-6">
       <p className="text-xs font-black text-muted uppercase tracking-widest">
         Showing <span className="text-main">{skip + 1}</span> to <span className="text-main">{Math.min(skip + take, total)}</span> of <span className="text-primary">{total}</span> operations
       </p>
       <div className="flex gap-2">
          <button 
            disabled={skip === 0}
            onClick={onPrev}
            className="w-12 h-12 bg-bg-main border border-standard flex items-center justify-center text-muted hover:bg-[#EBF2FF] hover:text-primary hover:border-[#1E67FC]/30 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer group"
          >
            <CaretLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" weight="duotone" />
          </button>
          <button 
            disabled={skip + take >= total}
            onClick={onNext}
            className="w-12 h-12 bg-bg-main border border-standard flex items-center justify-center text-muted hover:bg-[#EBF2FF] hover:text-primary hover:border-[#1E67FC]/30 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer group"
          >
            <CaretRight size={20} className="group-hover:translate-x-0.5 transition-transform" weight="duotone" />
          </button>
       </div>
    </div>
  );
};
