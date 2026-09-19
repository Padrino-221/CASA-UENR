'use client';

import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import Portal from './Portal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  overflowVisible?: boolean;
}

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  maxWidth = 'max-w-lg',
  overflowVisible = false
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Refined Backdrop */}
        <div 
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md animate-in fade-in duration-500"
          onClick={onClose}
        />
        
        {/* Premium Flow Popup */}
        <div className={cn(
          "relative bg-white w-full border border-standard flex flex-col max-h-[92vh]",
          overflowVisible ? "overflow-visible" : "overflow-hidden",
          "animate-in zoom-in-[0.98] fade-in slide-in-from-bottom-5 duration-500 ease-out",
          maxWidth
        )}>
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 flex justify-between items-start bg-white relative z-10">
            <div className="flex-1 pr-6">
              {title && (
                <h2 className="text-[26px] font-black text-[#0F172A] tracking-tighter leading-[1.1] mb-2 font-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-[#475569] text-sm font-bold uppercase tracking-wide opacity-80 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center bg-[#E2E8F0]/50 hover:bg-[#E2E8F0] border border-transparent hover:border-black/5 transition-all text-slate-400 hover:text-slate-900 focus:outline-none shrink-0"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
          
          {/* Main Body */}
          <div className={cn(
            "px-8 pb-10 relative z-10",
            overflowVisible ? "overflow-visible" : "overflow-y-auto no-scrollbar"
          )}>
            {children}
          </div>
          
          {/* Decorative Subtle Fade */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
