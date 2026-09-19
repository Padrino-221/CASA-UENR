import React, { useState, useEffect } from 'react';
import {
  Globe,
  Pencil,
  Trash,
  CaretRight
} from '@phosphor-icons/react';

import Link from 'next/link';
import { Region } from '@/types/models';
import { Pagination } from '@/components/ui/Pagination';

interface RegionTableProps {
  regions: Region[];
  userRole: string | undefined;
  onEdit: (region: Region) => void;
  onDelete: (id: string) => void;
}

export const RegionTable: React.FC<RegionTableProps> = ({ regions, userRole, onEdit, onDelete }) => {
  const isNationalAdmin = userRole === 'NATIONAL_ADMIN';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [regions.length]);

  const totalItems = regions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRegions = regions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="card table-card overflow-hidden ! border-black/5">
      <div className="overflow-x-auto">
        <table className="ds-table w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Region
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Chapters
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Total Members
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Status
              </th>
              <th className="bg-slate-50/50 p-6 text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                Access
              </th>
              {isNationalAdmin && (
                <th className="bg-slate-50/50 p-6 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-black/5">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedRegions.length > 0 ? (
              paginatedRegions.map((region) => (
                <tr
                  key={region.id}
                  className="group border-b border-black/5 last:border-0 hover:bg-slate-50/60 transition-all"
                >
                  {/* Region Name */}
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-black/5 group-hover:bg-[#EBF2FF] group-hover:text-[#1E67FC] group-hover:scale-105 transition-all">
                        <Globe size={20} weight="duotone" />
                      </div>
                      <div>
                        <span className="font-black text-main text-base block leading-tight tracking-tight">
                          {region.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1 block">
                          Region
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Chapters */}
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-main tracking-tight leading-none">
                        {region._count?.chapters || 0}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1.5">
                        Chapters
                      </span>
                    </div>
                  </td>

                  {/* Total Members */}
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-main tracking-tight leading-none">
                        {region._count?.students || 0}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1.5">
                        Members
                      </span>
                    </div>
                  </td>

                  {/* Active Status */}
                  <td className="p-6">
                    <span className="inline-flex text-[9px] font-black uppercase tracking-[0.15em] text-primary bg-primary/10 px-2.5 py-1 leading-none">
                      Active
                    </span>
                  </td>

                  {/* Enter Region Link */}
                  <td className="p-6">
                    <Link
                      href={`/chapters?regionId=${region.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-primary/10 hover:text-primary text-secondary font-bold text-xs uppercase tracking-widest transition-all border border-black/5"
                    >
                      <span>Enter</span>
                      <CaretRight size={14} weight="duotone" />
                    </Link>
                  </td>

                  {/* Actions Column (NATIONAL_ADMIN only) */}
                  {isNationalAdmin && (
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(region)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors border border-black/5"
                          title="Edit"
                        >
                          <Pencil size={14} weight="duotone" />
                        </button>
                        <button
                          onClick={() => onDelete(region.id)}
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
                <td colSpan={isNationalAdmin ? 6 : 5} className="text-center py-20 bg-slate-50/10">
                  <p className="text-slate-400 font-bold">No regions yet.</p>
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
        itemLabel="regions"
        onPrevious={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      />
    </div>
  );
};
