import React from 'react';
import Modal from '@/components/ui/Modal';
import { Region } from '@/types/models';

interface RegionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingRegion: Region | null;
  setEditingRegion: (val: Region | null | ((prev: Region | null) => Region | null)) => void;
  isSubmitting: boolean;
}

export const RegionEditModal: React.FC<RegionEditModalProps> = ({
  isOpen, onClose, onSubmit, editingRegion, setEditingRegion, isSubmitting
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Edit Region"
    >
      <form onSubmit={onSubmit} className="space-y-6">
         <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Region Name</label>
           <input 
             type="text" 
             placeholder="e.g. Greater Accra Region"
             value={editingRegion?.name || ''}
              onChange={e => setEditingRegion((prev: Region | null) => prev ? { ...prev, name: e.target.value } : null)}
             required
             className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
           />
         </div>
         <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-100">
            <button type="button" className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all">
              {isSubmitting ? 'Saving...' : 'Update Region'}
            </button>
         </div>
      </form>
    </Modal>
  );
};
