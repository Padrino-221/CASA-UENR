import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Semester } from '@/types/models';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (payload: any) => void;
  editingSem?: Semester | null;
}

const SemesterForm = ({ editingSem, onSubmit, onClose }: { editingSem: Semester | null | undefined; onSubmit: (payload: Record<string, unknown>) => void; onClose: () => void }) => {
  const [startDate, setStartDate] = useState<Date>(editingSem ? new Date(editingSem.startDate) : new Date());
  const [endDate, setEndDate] = useState<Date>(
    editingSem ? new Date(editingSem.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 4))
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      name: formData.get('name'),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={editingSem ? "Edit Semester" : "Add Semester"} overflowVisible={true}>
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        
        {/* Semester Designation */}
        <div>
          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block ml-1">Semester Designation</label>
          <input 
            name="name" 
            type="text" 
            defaultValue={editingSem?.name} 
            placeholder="e.g. First Semester" 
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
            {editingSem ? "Update Semester" : "Create Semester"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const SemesterModal: React.FC<SemesterModalProps> = ({ isOpen, onClose, onSubmit, editingSem }) => {
  return (
    <>
      {isOpen && <SemesterForm key={editingSem?.id ?? 'new'} editingSem={editingSem} onSubmit={onSubmit} onClose={onClose} />}
    </>
  );
};
