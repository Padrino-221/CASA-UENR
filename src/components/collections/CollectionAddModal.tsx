import React from 'react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';

interface CollectionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newCol: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNewCol: (val: any) => void;
  institutions: { id: string; name: string }[];
  members: { id: string; name: string; studentId?: string }[];
  isSubmitting: boolean;
}

export const CollectionAddModal: React.FC<CollectionAddModalProps> = ({
  isOpen, onClose, onSubmit, newCol, setNewCol, institutions, members, isSubmitting
}) => {
  const flowTypeOptions = [
    { label: 'Income (Inflow)', value: 'INCOME' },
    { label: 'Expense (Outflow)', value: 'EXPENSE' }
  ];

  const incomeCategoryOptions = [
    { label: 'Tithe', value: 'Tithe' },
    { label: 'Offering', value: 'Offering' },
    { label: 'Building Fund', value: 'Building Fund' },
    { label: 'Welfare', value: 'Welfare' },
    { label: 'Missions', value: 'Missions' }
  ];

  const expenseCategoryOptions = [
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Rent', value: 'Rent' },
    { label: 'Honorarium', value: 'Honorarium' },
    { label: 'Repairs', value: 'Repairs' },
    { label: 'Outreach Cost', value: 'Outreach Cost' },
    { label: 'Admin', value: 'Admin' }
  ];

  const chapterOptions = institutions.map((inst: { id: string; name: string }) => ({ label: inst.name, value: inst.id }));
  const memberOptions = [
    { label: 'General', value: '' },
    ...members.map((mem: { name: string; studentId?: string; id: string }) => ({ label: `${mem.name} (${mem.studentId})`, value: mem.id }))
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Add Collection"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* Amount & Date Input Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Amount (GHS)</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={newCol.amount}
              onChange={e => setNewCol({...newCol, amount: e.target.value})}
              required 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A]"
            />
          </div>
          <div className="flex flex-col justify-end">
            <CustomDateTimePicker 
              label="Date & Time"
              value={newCol.date ? new Date(newCol.date) : new Date()}
              onChange={val => setNewCol({...newCol, date: val.toISOString().split('T')[0]})}
              popoverDirection="left"
            />
          </div>
        </div>

        {/* Flow Type & Category Dropdowns Grid */}
        <div className="grid grid-cols-2 gap-6">
          <CustomDropdown
            label="Transaction Type"
            value={newCol.type}
            onChange={val => setNewCol({...newCol, type: val, category: val === 'INCOME' ? 'Offering' : 'Utilities'})}
            options={flowTypeOptions}
          />
          <CustomDropdown
            label="Category"
            value={newCol.category}
            onChange={val => setNewCol({...newCol, category: val})}
            options={newCol.type === 'INCOME' ? incomeCategoryOptions : expenseCategoryOptions}
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Description</label>
          <input 
            type="text" 
            placeholder="Provide context for this transaction..." 
            value={newCol.description}
            onChange={e => setNewCol({...newCol, description: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A]"
          />
        </div>

        {/* Chapter Dropdown */}
        <CustomDropdown
          label="Chapter"
          value={newCol.chapterId}
          onChange={val => setNewCol({...newCol, chapterId: val})}
          options={chapterOptions}
          placeholder="Select chapter..."
        />

        {/* Contributor Dropdown */}
        <CustomDropdown
          label="Contributor (Optional Member Link)"
          value={newCol.studentId}
          onChange={val => setNewCol({...newCol, studentId: val})}
          options={memberOptions}
        />

        {/* Form Actions Panel */}
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
            disabled={isSubmitting} 
            className="bg-[#1E67FC] hover:bg-[#0F53D6] disabled:opacity-50 text-white px-8 h-12 font-black text-xs uppercase tracking-widest transition-all"
          >
            {isSubmitting ? 'Adding...' : 'Add Collection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
