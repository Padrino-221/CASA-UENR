import React from 'react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface StudentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newMember: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNewMember: (val: any) => void;
  chapters: { id: string; name: string }[];
  isSubmitting: boolean;
}

export const StudentAddModal: React.FC<StudentAddModalProps> = ({
  isOpen, onClose, onSubmit, newMember, setNewMember, chapters, isSubmitting
}) => {
  const chapterOptions = chapters.map((ch: { id: string; name: string }) => ({ label: ch.name, value: ch.id }));
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
      title="Add Member"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. Samuel Kojo Mensah" 
            value={newMember.name}
            onChange={e => setNewMember({...newMember, name: e.target.value})}
            required 
            className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Official Student ID</label>
            <input 
              type="text" 
              placeholder="ID Number" 
              value={newMember.studentId}
              onChange={e => setNewMember({...newMember, studentId: e.target.value})}
              required 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
          <CustomDropdown
            label="Academic Level"
            value={newMember.levelYear}
            onChange={val => setNewMember({...newMember, levelYear: val})}
            options={levelOptions}
            placeholder="Select Level..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomDropdown
            label="Max Level"
            value={newMember.maxLevel}
            onChange={val => setNewMember({...newMember, maxLevel: val})}
            options={maxLevelOptions}
          />
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Department</label>
            <input 
              type="text" 
              placeholder="e.g. Computer Science" 
              value={newMember.department}
              onChange={e => setNewMember({...newMember, department: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomDropdown
            label="Chapter"
            value={newMember.chapterId}
            onChange={val => setNewMember({...newMember, chapterId: val})}
            options={chapterOptions}
            placeholder="Select Chapter..."
          />
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="Email address..." 
              value={newMember.email}
              onChange={e => setNewMember({...newMember, email: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Phone Number</label>
          <input 
            type="tel" 
            placeholder="Phone number..." 
            value={newMember.phone}
            onChange={e => setNewMember({...newMember, phone: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
          />
        </div>

        <CustomDropdown
          label="Status"
          value={newMember.status}
          onChange={val => setNewMember({...newMember, status: val})}
          options={statusOptions}
        />

        <div className="bg-slate-50 p-6 border border-black/5 space-y-4">
           <div className="flex items-center justify-between">
               <h4 className="text-[10px] uppercase font-black text-[#0F172A] tracking-[0.2em]">Leadership Role</h4>
              <input 
                type="checkbox" 
                checked={newMember.isLeader}
                onChange={e => setNewMember({...newMember, isLeader: e.target.checked})}
                className="w-5 h-5 accent-[#1E67FC] cursor-pointer"
              />
           </div>
           {newMember.isLeader && (
              <input 
                type="text" 
                placeholder="Position (e.g. Local President)" 
                value={newMember.position}
                onChange={e => setNewMember({...newMember, position: e.target.value})}
                className="w-full p-4 bg-white border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder:text-slate-400"
              />
           )}
        </div>

        <div className="flex justify-center items-center gap-3 pt-6">
          <button type="button" className="px-6 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-black text-sm transition-all" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-sm transition-all">
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
