import React from 'react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { Student } from '@/types/models';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingStudent: Student | null;
  setEditingStudent: (val: Student | null | ((prev: Student | null) => Student | null)) => void;
  isSubmitting: boolean;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  isOpen, onClose, onSubmit, editingStudent, setEditingStudent, isSubmitting
}) => {
  const levelOptions = ['', '100', '200', '300', '400', '500', '600', '700'].map(v => ({
    label: v ? `Level ${v}` : 'Select Level...', value: v
  }));
  const maxLevelOptions = [
    { label: '4-Year Program', value: '400' },
    { label: '5-Year Program', value: '500' },
    { label: '6-Year Program', value: '600' },
    { label: '7-Year Program', value: '700' }
  ];
  const statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Alumni', value: 'ALUMNI' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Edit Member"
    >
      <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-4 no-scrollbar">
        <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Full Name</label>
          <input 
            type="text" 
            value={editingStudent?.name || ''}
            onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, name: e.target.value} : null)}
            required 
            className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Official Student ID</label>
            <input 
              type="text" 
              value={editingStudent?.studentId || ''}
              onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, studentId: e.target.value} : null)}
              required 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
          <CustomDropdown
            label="Status"
            value={editingStudent?.status || 'ACTIVE'}
            onChange={val => setEditingStudent((prev: Student | null) => prev ? {...prev, status: val} : null)}
            options={statusOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomDropdown
            label="Academic Level"
            value={editingStudent?.levelYear || ''}
            onChange={val => setEditingStudent((prev: Student | null) => prev ? {...prev, levelYear: val} : null)}
            options={levelOptions}
            placeholder="Select Level..."
          />
          <CustomDropdown
            label="Max Level"
            value={editingStudent?.maxLevel || '400'}
            onChange={val => setEditingStudent((prev: Student | null) => prev ? {...prev, maxLevel: val} : null)}
            options={maxLevelOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Department</label>
            <input 
              type="text" 
              value={editingStudent?.department || ''}
              onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, department: e.target.value} : null)}
              placeholder="e.g. Computer Science" 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Email Address</label>
            <input 
              type="email" 
              value={editingStudent?.email || ''}
              onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, email: e.target.value} : null)}
              placeholder="Email address..." 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Phone Number</label>
            <input 
              type="tel" 
              value={editingStudent?.phone || ''}
              onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, phone: e.target.value} : null)}
              placeholder="Phone number..." 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 border border-black/5 space-y-4">
           <div className="flex items-center justify-between">
               <h4 className="text-[10px] uppercase font-black text-[#0F172A] tracking-[0.2em]">Leadership Role</h4>
              <input 
                type="checkbox" 
                checked={editingStudent?.isLeader || false}
                onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, isLeader: e.target.checked} : null)}
                className="w-5 h-5 accent-[#1E67FC] cursor-pointer"
              />
           </div>
           {editingStudent?.isLeader && (
              <input 
                type="text" 
                placeholder="Position (e.g. Secretary)" 
                value={editingStudent?.position || ''}
                onChange={e => setEditingStudent((prev: Student | null) => prev ? {...prev, position: e.target.value} : null)}
                className="w-full p-4 bg-white border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
              />
           )}
        </div>

        <div className="flex justify-center items-center gap-3 pt-6">
          <button type="button" className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all">
            {isSubmitting ? 'Saving...' : 'Update Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
