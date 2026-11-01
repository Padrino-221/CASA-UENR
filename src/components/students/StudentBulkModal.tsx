import React from 'react';
import {
  FileArrowUp,
  DownloadSimple
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';

interface StudentBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  bulkFile: File | null;
  setBulkFile: (file: File | null) => void;
  onDownloadTemplate: () => void;
  isSubmitting: boolean;
}

export const StudentBulkModal: React.FC<StudentBulkModalProps> = ({
  isOpen, onClose, onSubmit, bulkFile, setBulkFile, onDownloadTemplate, isSubmitting
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Members"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        <div
          className="border-2 border-dashed border-slate-200 p-12 text-center hover:bg-slate-50 transition-colors group cursor-pointer relative"
          onClick={() => document.getElementById('bulk-file-input')?.click()}
        >
          <input
            id="bulk-file-input"
            type="file"
            accept=".csv"
            className="hidden rounded-md text-base"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
          />
          <div className="w-16 h-16 bg-[#EBF2FF] text-[#1D4ED8] flex items-center justify-center mx-auto mb-6  transition-transform">
            <FileArrowUp size={32} weight="duotone" />
          </div>
          {bulkFile ? (
            <div>
              <p className="font-semibold text-[#0F172A] text-base">{bulkFile.name}</p>
              <p className="text-sm text-slate-500 font-semibold normal-case tracking-normal mt-1.5">Ready for processing</p>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-[#0F172A] text-base">Select Roster File</h4>
              <p className="text-sm text-slate-500 font-semibold normal-case tracking-normal mt-2">Drop your .csv file here or click to browse</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="flex items-center justify-center gap-2 text-[#1D4ED8] hover:text-[#0F53D6] text-sm font-semibold normal-case tracking-normal hover:underline"
          >
            <DownloadSimple size={14} weight="duotone" />
            <span>Download Import Template</span>
          </button>

          <div className="flex justify-center items-center gap-3">
            <button type="button" className="px-6 h-12 text-slate-500 hover:text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting || !bulkFile}
              className="bg-[#1D4ED8] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-semibold text-sm transition-all"
            >
              {isSubmitting ? 'Importing...' : 'Import All'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
