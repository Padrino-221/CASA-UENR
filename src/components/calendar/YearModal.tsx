import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { AcademicYear } from '@/types/models';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';

interface YearModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (payload: any) => void;
  editingYear?: AcademicYear | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  institutions?: any[];
}

const YearForm = ({ editingYear, onSubmit, onClose }: { editingYear: AcademicYear | null | undefined; onSubmit: (payload: Record<string, unknown>) => void; onClose: () => void }) => {
  const [selectedInstitutionId] = useState(editingYear?.chapterId || '');
  const [startDate, setStartDate] = useState<Date>(editingYear ? new Date(editingYear.startDate) : new Date());
  const [endDate, setEndDate] = useState<Date>(
    editingYear ? new Date(editingYear.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      name: formData.get('name'),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      chapterId: selectedInstitutionId || undefined
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={editingYear ? "Edit Academic Year" : "New Academic Year"} overflowVisible={true}>
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        
        {/* Year Group Name */}
        <div>
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Year Group Name</label>
          <input 
            name="name" 
            type="text" 
            defaultValue={editingYear?.name} 
            placeholder="e.g. 2024 / 2025" 
            required 
            className="w-full p-4 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-[#0F172A] placeholder-slate-400" 
          />
        </div>

        {/* Date Time Picker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CustomDateTimePicker 
              label="Start Date & Time"
              value={startDate}
              onChange={setStartDate}
              popoverDirection="left"
            />
          </div>
          <div>
            <CustomDateTimePicker 
              label="End Date & Time"
              value={endDate}
              onChange={setEndDate}
              popoverDirection="right"
            />
          </div>
        </div>

        {/* Form Actions Footer Panel */}
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
            className="bg-[#1E67FC] hover:bg-[#0F53D6] text-white px-8 h-12 font-black text-xs uppercase tracking-widest transition-all"
          >
            {editingYear ? "Save Changes" : "Create Year"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const YearModal: React.FC<YearModalProps> = ({ isOpen, onClose, onSubmit, editingYear }) => {
  return (
    <>
      {isOpen && <YearForm key={editingYear?.id ?? 'new'} editingYear={editingYear} onSubmit={onSubmit} onClose={onClose} />}
    </>
  );
};
