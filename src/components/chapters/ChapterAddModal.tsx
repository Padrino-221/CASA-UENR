import React from 'react';
import {
  Shield
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';
import { Region } from '@/types/models';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface ChapterAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newCh: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNewCh: (val: any) => void;
  regions: Region[];
  isSubmitting: boolean;
  isNational: boolean;
}

export const ChapterAddModal: React.FC<ChapterAddModalProps> = ({
  isOpen, onClose, onSubmit, newCh, setNewCh, regions, isSubmitting, isNational
}) => {
  const regionOptions = regions.map((reg) => ({
    label: reg.name,
    value: reg.id
  }));

  const typeOptions = [
    { label: 'University', value: 'University' },
    { label: 'Polytechnic', value: 'Polytechnic' },
    { label: 'College', value: 'College' },
    { label: 'Secondary', value: 'Secondary' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Add Chapter"
    >
      <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Chapter Name</label>
            <input 
              type="text" 
              placeholder="e.g. University of Ghana Legon"
              value={newCh.name}
              onChange={e => setNewCh({...newCh, name: e.target.value})}
              required
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isNational && (
              <div>
                <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Region</label>
                <CustomDropdown 
                  options={regionOptions}
                  value={newCh.regionId}
                  onChange={val => setNewCh({...newCh, regionId: val})}
                  placeholder="Select Region"
                  className="w-full !space-y-0"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Type</label>
              <CustomDropdown 
                options={typeOptions}
                value={newCh.university || 'University'}
                onChange={val => setNewCh({...newCh, university: val})}
                placeholder="Select Type"
                className="w-full !space-y-0"
              />
            </div>
         </div>

         <div className="pt-6 border-t border-slate-100 space-y-4">
            <label className="text-[11px] uppercase font-black text-[#1E67FC] tracking-widest block ml-1 flex items-center gap-2">
               <Shield size={14} weight="duotone" /> Admin
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Admin Name</label>
                  <input 
                     type="text" 
                     placeholder="Assign primary admin..."
                     value={newCh.adminName}
                     onChange={e => setNewCh({...newCh, adminName: e.target.value})}
                     required
                     className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
                  />
               </div>
               <div>
                  <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Admin Email</label>
                  <input 
                     type="email" 
                     placeholder="Work email address..."
                     value={newCh.adminEmail}
                     onChange={e => setNewCh({...newCh, adminEmail: e.target.value})}
                     required
                     className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
                  />
               </div>
            </div>
            <div>
               <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Initial Password</label>
               <input 
                  type="password" 
                  placeholder="Specify secure password..."
                  value={newCh.adminPassword}
                  onChange={e => setNewCh({...newCh, adminPassword: e.target.value})}
                  required
                  className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
               />
            </div>
         </div>

         <div className="flex justify-center items-center gap-3 pt-6">
            <button type="button" className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all">
              {isSubmitting ? 'Adding...' : 'Add Chapter'}
            </button>
         </div>
      </form>
    </Modal>
  );
};
