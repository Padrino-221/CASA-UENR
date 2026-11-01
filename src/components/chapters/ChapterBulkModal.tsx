import React from 'react';
import {
  FileArrowUp,
  DownloadSimple
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';
import { Region } from '@/types/models';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface ChapterBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  role: string | undefined;
  targetRegionId: string;
  setTargetRegionId: (val: string) => void;
  regions: Region[];
  bulkFile: File | null;
  setBulkFile: (file: File | null) => void;
  onDownloadTemplate: () => void;
  isSubmitting: boolean;
}

export const ChapterBulkModal: React.FC<ChapterBulkModalProps> = ({
  isOpen, onClose, onSubmit, role, targetRegionId, setTargetRegionId, regions, bulkFile, setBulkFile, onDownloadTemplate, isSubmitting
}) => {
  const regionOptions = regions.map((reg) => ({
    label: reg.name,
    value: reg.id
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Chapters"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        {role === 'NATIONAL_ADMIN' && (
          <div className="space-y-2">
            <label className="text-[13px] normal-case font-semibold text-slate-500 tracking-normal block ml-1">Region</label>
            <CustomDropdown
              options={regionOptions}
              value={targetRegionId}
              onChange={val => setTargetRegionId(val)}
              placeholder="Select Region"
              className="w-full !space-y-0"
            />
          </div>
        )}

        <div
          className="border-2 border-dashed border-slate-200 p-12 text-center hover:bg-slate-50 transition-colors group cursor-pointer relative"
          onClick={() => document.getElementById('bulk-ch-input')?.click()}
        >
          <input
            id="bulk-ch-input"
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
              <p className="text-sm text-slate-500 font-semibold normal-case tracking-normal mt-1.5">Ready for import</p>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-[#0F172A] text-base">Select CSV File</h4>
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
            <span>Download Chapter Template</span>
          </button>

          <div className="flex justify-center items-center gap-3">
            <button type="button" className="px-6 h-12 text-slate-500 hover:text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting || !bulkFile}
              className="btn-lux-primary !px-8 !h-12 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding Chapters...' : 'Import All'}
             </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
