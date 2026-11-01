'use client';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import './admin-controls.css';
interface PaginationProps {
  currentPage: number; totalPages: number; startItem: number; endItem: number;
  totalItems: number; itemLabel: string; onPrevious: () => void; onNext: () => void;
}
export function Pagination({currentPage,totalPages,startItem,endItem,totalItems,itemLabel,onPrevious,onNext}:PaginationProps) {
  if(totalPages<=1)return null;
  return <nav className="admin-pagination" aria-label={`${itemLabel} pages`}>
    <p>Showing {totalItems ? startItem : 0}–{totalItems ? endItem : 0} of {totalItems} {itemLabel}</p>
    <div><button type="button" onClick={onPrevious} disabled={currentPage<=1} aria-label="Previous page"><CaretLeft size={18}/></button><span aria-live="polite">Page {currentPage} of {totalPages}</span><button type="button" onClick={onNext} disabled={currentPage>=totalPages} aria-label="Next page"><CaretRight size={18}/></button></div>
  </nav>;
}
