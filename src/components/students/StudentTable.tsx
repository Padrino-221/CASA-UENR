import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Pencil,
  Trash,
  Buildings,
  Users
} from '@phosphor-icons/react';

import { Student } from '@/types/models';
import { Pagination } from '@/components/ui/Pagination';
import { isLocalScope } from '@/lib/roles';

interface StudentTableProps {
  students: Student[];
  role: string | null;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, role, onEdit, onDelete, searchQuery }) => {
  const isLocalAdmin = isLocalScope(role);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [students.length, searchQuery]);

  const totalItems = students.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="card table-card overflow-hidden border-slate-200">
      <div className="overflow-x-auto">
        <table className="ds-table w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50/50 px-5 py-4 text-left text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                Member
              </th>
              <th className="bg-slate-50/50 px-5 py-4 text-left text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                Student ID
              </th>
              <th className="bg-slate-50/50 px-5 py-4 text-left text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                Level
              </th>
              <th className="bg-slate-50/50 px-5 py-4 text-left text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                Department
              </th>
              <th className="bg-slate-50/50 px-5 py-4 text-left text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                Chapter
              </th>
              <th className="bg-slate-50/50 px-5 py-4 text-left text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                Status
              </th>
              {isLocalAdmin && (
                <th className="bg-slate-50/50 px-5 py-4 text-right text-[13px] font-semibold normal-case tracking-normal text-slate-500 border-b border-slate-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length > 0 ? paginatedStudents.map((student) => {
              const isAlumni = student.status === 'ALUMNI' ||
                student.levelYear === 'Post-Grad' ||
                student.levelYear === 'Alumni' ||
                (student.levelYear && student.maxLevel ? parseInt(student.levelYear) > parseInt(student.maxLevel) : false);

              return (
                <tr key={student.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-main">{student.name}</span>
                        <span className="text-[13px] text-slate-500 normal-case font-semibold tracking-normal mt-0.5">
                          {isAlumni ? 'Alumni' : 'Undergraduate'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="bg-slate-50 px-2 py-1 text-secondary font-bold text-sm border border-slate-200">
                      {student.studentId}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isAlumni ? 'bg-slate-300' : 'bg-primary'}`} />
                      <span className="font-semibold text-main text-sm normal-case tracking-tighter">{student.levelYear || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-secondary text-sm font-bold">{student.department || 'Unassigned'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Buildings size={14} className="text-slate-500" weight="duotone" />
                      <span className="font-semibold text-sm truncate max-w-[120px] text-main">{student.chapter?.name ?? 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[13px] font-semibold normal-case tracking-normal ${isAlumni ? 'bg-primary/10 text-primary' :
                        student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-slate-100 text-slate-500'
                      }`}>
                      <UserCheck size={10} weight="duotone" />
                      {isAlumni ? 'ALUMNI' : student.status}
                    </span>
                  </td>
                  {isLocalAdmin && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button aria-label="Edit record"
                          onClick={() => onEdit(student)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors border border-slate-200"
                        >
                          <Pencil size={14} weight="duotone" />
                        </button>
                        <button aria-label="Delete record"
                          onClick={() => onDelete(student.id)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-200"
                        >
                          <Trash size={14} weight="duotone" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={isLocalAdmin ? 7 : 6} className="text-center py-20 bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Users size={48} className="text-slate-200" weight="duotone" />
                    <h3 className="text-lg font-bold text-slate-500">No matching members found</h3>
                    <p className="text-slate-500 text-sm italic">Try adjusting your filters or adding a new record.</p>
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
        itemLabel="members"
        onPrevious={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      />
    </div>
  );
};
