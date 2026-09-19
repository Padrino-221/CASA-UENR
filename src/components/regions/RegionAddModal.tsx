import React from 'react';
import {
  Shield
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';

interface RegionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newRegion: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNewRegion: (val: any) => void;
  isSubmitting: boolean;
}

export const RegionAddModal: React.FC<RegionAddModalProps> = ({
  isOpen, onClose, onSubmit, newRegion, setNewRegion, isSubmitting
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Add Region"
    >
      <form onSubmit={onSubmit} className="space-y-6">
         <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Region Name</label>
           <input 
             type="text" 
             placeholder="e.g. Greater Accra Region"
             value={newRegion.name}
             onChange={e => setNewRegion({ ...newRegion, name: e.target.value })}
             required
             className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
           />
         </div>

         <div className="pt-6 border-t border-slate-100 space-y-4">
           <label className="text-[11px] uppercase font-black text-[#1E67FC] tracking-widest block ml-1 flex items-center gap-2">
              <Shield size={14} weight="duotone" /> Admin Account
           </label>
           <div>
              <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Full Name</label>
             <input 
               type="text" 
               placeholder="Assign primary regional admin..."
               value={newRegion.adminName}
               onChange={e => setNewRegion({ ...newRegion, adminName: e.target.value })}
               required
               className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
             />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Email</label>
               <input 
                 type="email" 
                 placeholder="Work email address..."
                 value={newRegion.adminEmail}
                 onChange={e => setNewRegion({ ...newRegion, adminEmail: e.target.value })}
                 required
                 className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
               />
             </div>
             <div>
               <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Initial Password</label>
               <input 
                 type="password" 
                 placeholder="Specify secure password..."
                 value={newRegion.adminPassword}
                 onChange={e => setNewRegion({ ...newRegion, adminPassword: e.target.value })}
                 required
                 className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
               />
             </div>
           </div>
         </div>

         <div className="flex justify-center items-center gap-3 pt-6">
            <button type="button" className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all">
              {isSubmitting ? 'Adding...' : 'Add Region'}
            </button>
         </div>
      </form>
    </Modal>
  );
};
