'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder = "Select an option...",
  className
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-1.5 relative", className)} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-slate-50 hover:bg-slate-100/80 border border-black/5 px-4 py-2.5 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-between outline-none group",
          isOpen ? "border-[#1E67FC]/30 bg-white text-[#1E67FC]" : ""
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown size={14} 
          className={cn("text-slate-400 transition-transform duration-300 ml-2 shrink-0", isOpen && "rotate-180 text-[#1E67FC]")} weight="duotone" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-black/5 z-[3000] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[220px] overflow-y-auto no-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all mb-1 last:mb-0",
                  value === option.value 
                    ? "bg-[#EBF2FF] text-[#1E67FC]" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="truncate mr-2">{option.label}</span>
                {value === option.value && <Check size={12} weight="bold" className="shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
