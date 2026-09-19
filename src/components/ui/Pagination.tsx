'use client';

import React from 'react';
import {
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';


interface PaginationProps {
    currentPage: number;
    totalPages: number;
    startItem: number;
    endItem: number;
    totalItems: number;
    itemLabel: string;
    onPrevious: () => void;
    onNext: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    startItem,
    endItem,
    totalItems,
    itemLabel,
    onPrevious,
    onNext,
}) => {
    if (totalPages <= 1) {
        return null;
    }

    const displayStart = totalItems > 0 ? startItem : 0;
    const displayEnd = totalItems > 0 ? endItem : 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50/30 border-t border-black/5">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                Showing {displayStart} to {displayEnd} of {totalItems} {itemLabel}
            </span>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-[#1E67FC] hover:bg-[#EBF2FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 border border-black/5 transition-all"
                    title="Previous Page"
                >
                    <CaretLeft size={16} weight="duotone" />
                </button>

                <div className="px-4.5 h-9 flex items-center justify-center bg-slate-50 border border-black/5 font-extrabold text-[10px] uppercase tracking-widest text-[#0F172A]">
                    Page {currentPage} of {totalPages}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-[#1E67FC] hover:bg-[#EBF2FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 border border-black/5 transition-all"
                    title="Next Page"
                >
                    <CaretRight size={16} weight="duotone" />
                </button>
            </div>
        </div>
    );
};
