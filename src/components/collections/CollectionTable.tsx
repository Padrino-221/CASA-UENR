import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Trash,
  CurrencyDollarSimple
} from '@phosphor-icons/react';

import { Transaction } from '@/types/models';
import { Pagination } from '@/components/ui/Pagination';

interface CollectionTableProps {
  collections: Transaction[];
  role: string | null;
  onEdit: (col: Transaction) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  onAddClick: () => void;
}

export const CollectionTable: React.FC<CollectionTableProps> = ({ collections, role, onEdit, onDelete, searchQuery, onAddClick }) => {
  const isLocalAdmin = role === 'LOCAL_ADMIN';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [collections.length, searchQuery]);

  const totalItems = collections.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCollections = collections.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="card table-card overflow-hidden ! border-black/5">
      <div className="overflow-x-auto">
        <table className="ds-table">
        <thead>
          <tr>
            <th className="bg-slate-50/50 p-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Date</th>
            <th className="bg-slate-50/50 p-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Category</th>
            <th className="bg-slate-50/50 p-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Contributor</th>
            <th className="bg-slate-50/50 p-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">Chapter</th>
            <th className="bg-slate-50/50 p-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5 text-right">Amount (GHS)</th>
            {isLocalAdmin && <th className="bg-slate-50/50 p-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedCollections.length > 0 ? paginatedCollections.map((col) => (
            <tr key={col.id} className="border-b border-black/5 last:border-0 hover:bg-slate-50/40 transition-colors">
              <td className="p-6 text-sm font-medium text-slate-500">{new Date(col.date).toLocaleDateString()}</td>
              <td className="p-6">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider w-fit ${col.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {col.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{col.category}</span>
                </div>
              </td>
              <td className="p-6 font-bold text-[#0F172A]">{col.student ? col.student.name : 'Institutional'}</td>
              <td className="p-6 font-medium text-slate-600 italic text-xs">{col.chapter?.name ?? 'Unassigned'}</td>
              <td className="p-6 text-right font-extrabold">
                <span className={col.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}>
                  {col.type === 'INCOME' ? '+' : '-'} GH₵ {col.amount.toFixed(2)}
                </span>
              </td>
              {isLocalAdmin && (
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 text-right">
                    <button
                      onClick={() => onEdit(col)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-[#1E67FC] hover:bg-indigo-50 transition-colors border border-black/5"
                    >
                      <Pencil size={14} weight="duotone" />
                    </button>
                    <button
                      onClick={() => onDelete(col.id)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-black/5"
                    >
                      <Trash size={14} weight="duotone" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={isLocalAdmin ? 6 : 5} className="text-center py-20 bg-slate-50/30">
                <div className="flex flex-col items-center justify-center gap-4">
                  <CurrencyDollarSimple size={64} className="text-slate-200" weight="duotone" />
                  <h3 className="text-lg font-bold text-slate-400">{searchQuery ? 'No matches found' : 'No Transaction History'}</h3>
                  <p className="text-slate-400 text-sm italic">{searchQuery ? `No collections match "${searchQuery}"` : 'Recent collections will appear here after they are recorded.'}</p>
                  {isLocalAdmin && !searchQuery && <button className="btn btn-primary" onClick={onAddClick}>Add First Collection</button>}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startIndex + 1}
        endItem={endIndex}
        totalItems={totalItems}
        itemLabel="transactions"
        onPrevious={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      />
    </div>
  );
};
