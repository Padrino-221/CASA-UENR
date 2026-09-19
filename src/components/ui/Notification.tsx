'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Warning, 
  XCircle, 
  Info, 
  X 
} from '@phosphor-icons/react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
  onClose: () => void;
}

export const Toast = ({ message, type, duration, onClose }: ToastProps) => {
  const [progress, setProgress] = useState(100);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 400); 
  };

  useEffect(() => {
    // Entrance trigger
    const entranceTimeout = setTimeout(() => setIsEntering(true), 10);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        handleClose();
      }
    }, 10);

    return () => {
      clearInterval(interval);
      clearTimeout(entranceTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} weight="fill" />,
    error: <XCircle className="text-rose-500" size={20} weight="fill" />,
    warning: <Warning className="text-amber-500" size={20} weight="fill" />,
    info: <Info className="text-[#1E67FC]" size={20} weight="fill" />,
  };

  const statusLabels = {
    success: 'Success',
    error: 'Action Failed',
    warning: 'Attention Needed',
    info: 'System Update',
  };

  const borderClasses = {
    success: 'border-emerald-500/10 hover:border-emerald-500/20',
    error: 'border-rose-500/10 hover:border-rose-500/20',
    warning: 'border-amber-500/10 hover:border-amber-500/20',
    info: 'border-[#1E67FC]/10 hover:border-[#1E67FC]/20',
  };

  const iconContainerClasses = {
    success: 'bg-emerald-500/10 text-emerald-500',
    error: 'bg-rose-500/10 text-rose-500',
    warning: 'bg-amber-500/10 text-amber-500',
    info: 'bg-[#1E67FC]/10 text-[#1E67FC]',
  };

  const progressGradientClasses = {
    success: 'from-emerald-500 to-teal-400',
    error: 'from-rose-500 to-pink-500',
    warning: 'from-amber-500 to-yellow-500',
    info: 'from-[#1E67FC] to-sky-400',
  };

  return (
    <div 
      className={`
        pointer-events-auto w-96 bg-white/95 border p-5 overflow-hidden relative
        transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
        ${borderClasses[type]}
        ${!isEntering ? 'opacity-0 translate-y-4 scale-90 blur-sm' : ''}
        ${isEntering && !isExiting ? 'opacity-100 translate-y-0 scale-100 blur-0' : ''}
        ${isExiting ? 'opacity-0 -translate-y-8 scale-95 blur-md' : ''}
      `}
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-start gap-4">
        
        {/* Left Column Icon Container */}
        <div className={`mt-0.5 w-10 h-10 flex items-center justify-center shrink-0 ${iconContainerClasses[type]}`}>
          {icons[type]}
        </div>

        {/* Right Column Title & Message */}
        <div className="flex-1 pt-0.5 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
            {statusLabels[type]}
          </span>
          <p className="text-[12px] font-black text-[#0F172A] leading-relaxed tracking-wide break-words">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-50 transition-all shrink-0 mt-0.5"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      {/* Premium Infinite Progress Bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100/50 w-full">
        <div 
          className={`h-full bg-gradient-to-r ${progressGradientClasses[type]}`}
          style={{ 
            width: `${progress}%`,
            transition: 'width 100ms linear'
          }}
        />
      </div>

      {/* Internal Glossy highlight reflection */}
      <div className="absolute inset-0 pointer-events-none border border-white/60" />
    </div>
  );
};
