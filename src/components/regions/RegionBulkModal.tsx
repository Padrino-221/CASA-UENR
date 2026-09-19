import React from 'react';
import {
  FileArrowUp,
  DownloadSimple
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';

interface RegionBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  bulkFile: File | null;
  setBulkFile: (file: File | null) => void;
  onDownloadTemplate: () => void;
  isSubmitting: boolean;
}

export const RegionBulkModal: React.FC<RegionBulkModalProps> = ({
  isOpen, onClose, onSubmit, bulkFile, setBulkFile, onDownloadTemplate, isSubmitting
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Import Regions"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        <div 
          className="border-2 border-dashed border-slate-200 p-12 text-center hover:bg-bg-main transition-colors group cursor-pointer relative"
          onClick={() => document.getElementById('bulk-region-input')?.click()}
        >
          <input 
            id="bulk-region-input"
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
          />
          <div className="w-16 h-16 bg-[#EBF2FF] text-[#1E67FC] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <FileArrowUp size={32} weight="duotone" />
          </div>
          {bulkFile ? (
            <div>
              <p className="font-black text-[#0F172A] text-base">{bulkFile.name}</p>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-1.5">Ready for import</p>
            </div>
          ) : (
            <div>
              <h4 className="font-black text-[#0F172A] text-base">Select CSV File</h4>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mt-2">Drop your .csv file here or click to browse</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <button 
            type="button" 
            onClick={onDownloadTemplate}
            className="flex items-center justify-center gap-2 text-[#1E67FC] hover:text-[#0F53D6] text-xs font-black uppercase tracking-widest hover:underline"
          >
            <DownloadSimple size={14} weight="duotone" />
            <span>Download Region Template</span>
          </button>

          <div className="flex justify-center items-center gap-3">
            <button type="button" className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting || !bulkFile} 
              className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all"
            >
              {isSubmitting ? 'Importing...' : 'Import All'}
             </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
