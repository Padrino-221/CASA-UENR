import React, { useState, useEffect } from 'react';
import {
  Buildings,
  Pencil,
  Trash,
  CaretRight
} from '@phosphor-icons/react';

import Link from 'next/link';
import { Chapter } from '@/types/models';
import { Pagination } from '@/components/ui/Pagination';

interface ChapterTableProps {
  chapters: Chapter[];
  role: string | undefined;
  onEdit: (ch: Chapter) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
  cutoffDate?: string | null;
  isNational?: boolean;
}

export const ChapterTable: React.FC<ChapterTableProps> = ({ chapters, role, onEdit, onDelete, searchQuery = '', cutoffDate, isNational }) => {
  const hasAccess = role === 'REGIONAL_ADMIN';

  const colCount = 5 + (isNational ? 1 : 0) + (hasAccess ? 1 : 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isNewChapter = (createdAt: string) => {
    if (!cutoffDate) return false;
    return new Date(createdAt) >= new Date(cutoffDate);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [chapters.length, searchQuery]);

  const totalItems = chapters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedChapters = chapters.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="card table-card overflow-hidden ! border-black/5">
      <div className="overflow-x-auto">
        <table className="ds-table w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Chapter
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Region
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Total Members
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Financial Records
              </th>
              {isNational && (
                <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                  Created
                </th>
              )}
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Access
              </th>
              {hasAccess && (
                <th className="bg-slate-50/50 p-6 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedChapters.length > 0 ? (
              paginatedChapters.map((ch) => (
                <tr
                  key={ch.id}
                  className="group border-b border-black/5 last:border-0 hover:bg-slate-50/60 transition-all"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-black/5 group-hover:bg-[#EBF2FF] group-hover:text-[#1E67FC] group-hover:scale-105 transition-all">
                        <Buildings size={20} weight="duotone" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-main text-base block leading-tight tracking-tight">
                            {ch.name}
                          </span>
                          {isNational && isNewChapter(ch.createdAt) && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 uppercase tracking-widest leading-none">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1 block">
                          Chapter
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-6">
                    <span className="font-black text-main text-sm tracking-tight leading-none">
                      {ch.region.name}
                    </span>
                  </td>

                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-main tracking-tight leading-none">
                        {ch._count?.students || 0}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1.5">
                        Members
                      </span>
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-main tracking-tight leading-none">
                        {ch._count?.collections || 0}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1.5">
                        Records
                      </span>
                    </div>
                  </td>

                  {isNational && (
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-main tracking-tight leading-none">
                          {formatDate(ch.createdAt)}
                        </span>
                        {isNewChapter(ch.createdAt) && (
                          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest mt-1.5">
                            This Year
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  <td className="p-6">
                    <Link
                      href={`/collections?chapterId=${ch.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-primary/10 hover:text-primary text-secondary font-black text-xs uppercase tracking-widest transition-all border border-black/5"
                    >
                      <span>Enter</span>
                      <CaretRight size={14} weight="duotone" />
                    </Link>
                  </td>

                  {hasAccess && (
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(ch)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors border border-black/5"
                          title="Edit"
                        >
                          <Pencil size={14} weight="duotone" />
                        </button>
                        <button
                          onClick={() => onDelete(ch.id)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-black/5"
                          title="Delete"
                        >
                          <Trash size={14} weight="duotone" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colCount} className="text-center py-20 bg-slate-50/10">
                  <p className="text-slate-400 font-bold">No chapters found matching the current filter.</p>
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
        itemLabel="chapters"
        onPrevious={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      />
    </div>
  );
};
