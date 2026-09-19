import React from 'react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';
import { Transaction } from '@/types/models';

interface CollectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingCol: Transaction | null;
  setEditingCol: (val: Transaction | null | ((prev: Transaction | null) => Transaction | null)) => void;
  isSubmitting: boolean;
}

export const CollectionEditModal: React.FC<CollectionEditModalProps> = ({
  isOpen, onClose, onSubmit, editingCol, setEditingCol, isSubmitting
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Edit Collection"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Amount (GHS)</label>
            <input 
              type="number" 
              step="0.01" 
              value={editingCol?.amount || ''}
              onChange={e => setEditingCol((prev: Transaction | null) => prev ? {...prev, amount: parseFloat(e.target.value)} : null)}
              required 
              className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A]"
            />
          </div>
          <div className="flex flex-col justify-end">
            <CustomDateTimePicker 
              label="Date & Time"
              value={editingCol?.date ? new Date(editingCol.date) : new Date()}
              onChange={val => setEditingCol((prev: Transaction | null) => prev ? {...prev, date: val.toISOString()} : null)}
              popoverDirection="left"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <CustomDropdown
            label="Flow Type"
            value={editingCol?.type || 'INCOME'}
            onChange={val => setEditingCol((prev: Transaction | null) => prev ? {...prev, type: val, category: val === 'INCOME' ? 'Offering' : 'Utilities'} : null)}
            options={flowTypeOptions}
          />
          <CustomDropdown
            label="Category"
            value={editingCol?.category || 'Offering'}
            onChange={val => setEditingCol((prev: Transaction | null) => prev ? {...prev, category: val} : null)}
            options={editingCol?.type === 'INCOME' ? incomeCategoryOptions : expenseCategoryOptions}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Description</label>
          <input 
            type="text" 
            placeholder="Provide context for this transaction..." 
            value={editingCol?.description || ''}
              onChange={e => setEditingCol((prev: Transaction | null) => prev ? {...prev, description: e.target.value} : null)}
            className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A]"
          />
        </div>

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
            {isSubmitting ? 'Updating...' : 'Update Collection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
