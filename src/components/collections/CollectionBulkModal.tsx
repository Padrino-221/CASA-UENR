import React from 'react';
import {
  FileArrowUp,
  DownloadSimple
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';

interface CollectionBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  bulkFile: File | null;
  setBulkFile: (file: File | null) => void;
  onDownloadTemplate: () => void;
  isSubmitting: boolean;
}

export const CollectionBulkModal: React.FC<CollectionBulkModalProps> = ({
  isOpen, onClose, onSubmit, bulkFile, setBulkFile, onDownloadTemplate, isSubmitting
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Import Collections"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        
        {/* Interactive Roster Upload Card Drop Zone */}
        <div 
          className="border-2 border-dashed border-slate-200 hover:border-[#1E67FC]/30 p-12 text-center hover:bg-slate-50 transition-all group cursor-pointer relative"
          onClick={() => document.getElementById('bulk-col-input')?.click()}
        >
          <input 
            id="bulk-col-input"
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
          />
          <div className="w-16 h-16 bg-[#EBF2FF] text-[#1E67FC] flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
            <FileArrowUp size={28} weight="duotone" />
          </div>
          {bulkFile ? (
            <div>
              <p className="font-black text-[#0F172A] text-base">{bulkFile.name}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1.5">Ready for import</p>
            </div>
          ) : (
            <div>
              <h4 className="font-black text-[#0F172A] text-base">Select CSV File</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Drop your .csv ledger here or click to browse</p>
            </div>
          )}
        </div>

        {/* Template Downloads & Form Submissions */}
        <div className="flex flex-col gap-6">
          <button 
            type="button" 
            onClick={onDownloadTemplate}
            className="flex items-center justify-center gap-2 text-[#1E67FC] hover:text-[#0F53D6] text-[10px] font-black uppercase tracking-widest hover:underline transition-all"
          >
            <DownloadSimple size={14} weight="duotone" />
            <span>Download Template</span>
          </button>

          {/* Form Actions Footer Panel */}
          <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !bulkFile} 
              className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-xs uppercase tracking-widest transition-all"
            >
              {isSubmitting ? 'Importing...' : 'Import All'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
