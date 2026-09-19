import React from 'react';
import {
  User,
  Database,
  ShieldWarning,
  Key,
  Trash,
  UserPlus,
  ArrowsClockwise,
  Lock
} from '@phosphor-icons/react';

import { Pagination } from '@/components/ui/Pagination';
import type { AuditLog } from '@/types/models';
import { formatRoleLabel } from '@/lib/utils';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  take: number;
  skip: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, loading, take, skip, total, onPrev, onNext }) => {
  const formatMetadata = (metadata: string | null | undefined) => {
    if (!metadata) return 'No context provided';
    try {
      const obj = JSON.parse(metadata);
      return Object.entries(obj).map(([key, val]) => `${key}: ${val}`).join(', ');
    } catch {
      return metadata;
    }
  };

  const getActionConfig = (action: string) => {
    if (action.includes('DELETE') || action.includes('REVOKE')) {
      return {
        color: 'text-rose-600 bg-rose-50 border-rose-100',
        icon: Trash
      };
    }
    if (action.includes('CREATE') || action.includes('RESTORE') || action.includes('ADD')) {
      return {
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        icon: UserPlus
      };
    }
    if (action.includes('PASSWORD') || action.includes('AUTH') || action.includes('KEY')) {
      return {
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        icon: Key
      };
    }
    if (action.includes('UPDATE') || action.includes('MODIFY')) {
      return {
        color: 'text-[#1E67FC] bg-[#EBF2FF] border-[#1E67FC]/20',
        icon: ArrowsClockwise
      };
    }
    return {
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      icon: Lock
    };
  };

  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(total / take) || 1;
  const startIndex = skip;
  const endIndex = Math.min(skip + take, total);

  return (
    <div className="bg-white border border-black/5 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-slate-50/80 p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-black/5 text-left">Administrator</th>
            <th className="bg-slate-50/80 p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-black/5 text-left">Operation</th>
            <th className="bg-slate-50/80 p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-black/5 text-left">Subject Entity</th>
            <th className="bg-slate-50/80 p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-black/5 text-left">Context Details</th>
            <th className="bg-slate-50/80 p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-black/5 text-left">Execution Time</th>
          </tr>
        </thead>
        <tbody>
          {loading && logs.length === 0 ? (
            [...Array(take)].map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-black/5 last:border-0">
                <td className="p-6"><div className="h-12 bg-slate-100 w-48"></div></td>
                <td className="p-6"><div className="h-8 bg-slate-100 w-28"></div></td>
                <td className="p-6"><div className="h-6 bg-slate-100 w-36"></div></td>
                <td className="p-6 text-left"><div className="h-4 bg-slate-100 w-56"></div></td>
                <td className="p-6 text-left"><div className="h-8 bg-slate-100 w-32"></div></td>
              </tr>
            ))
          ) : logs.length > 0 ? (
            logs.map((log) => {
              const ActionIcon = getActionConfig(log.action).icon;
              return (
                <tr key={log.id} className="group transition-all hover:bg-slate-50/60 border-b border-black/5 last:border-0">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-black/5 group-hover:bg-[#EBF2FF] group-hover:text-[#1E67FC] group-hover:scale-105 transition-all">
                        <User size={20} weight="duotone" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-[#0F172A] text-sm truncate">{log.user.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {formatRoleLabel(log.user.role)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-widest border ${getActionConfig(log.action).color}`}>
                      <ActionIcon size={13} />
                      <span>{log.action.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[#0F172A] font-bold text-xs">
                      <Database size={15} className="text-slate-400 shrink-0" weight="duotone" />
                      <span className="truncate max-w-[140px] font-black">{log.entity}</span>
                      {log.entityId && (
                        <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold font-mono text-slate-500 border border-black/5 group-hover:bg-white transition-colors">
                          {log.entityId.substring(0, 8)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 max-w-[320px] text-left">
                    <p className="text-xs font-semibold text-slate-500 line-clamp-2 italic group-hover:text-[#0F172A] transition-colors leading-relaxed">
                      {formatMetadata(log.metadata)}
                    </p>
                  </td>
                  <td className="p-6 text-left">
                    <div className="flex flex-col items-start space-y-0.5">
                      <span className="text-xs font-black text-[#0F172A]">{new Date(log.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="text-[10px] font-black text-[#1E67FC] uppercase tracking-widest">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="py-28 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-slate-300 border border-black/5 ring-8 ring-slate-50/50">
                    <ShieldWarning size={36} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0F172A]">No Activity Logs</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1.5">Activity logs will appear here as administrators interact with the system.</p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startIndex + 1}
        endItem={endIndex}
        totalItems={total}
        itemLabel="operations"
        onPrevious={onPrev}
        onNext={onNext}
      />
    </div>
  );
};
