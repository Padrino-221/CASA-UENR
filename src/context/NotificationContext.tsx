'use client';
import {
  WarningCircle,
  Question
} from '@phosphor-icons/react';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, NotificationType } from '@/components/ui/Notification';

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

interface NotificationContextProps {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  confirm: (options: ConfirmOptions) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: NotificationType; duration: number }[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);

  const addToast = useCallback((message: string, type: NotificationType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleConfirm = () => {
    if (confirmState) {
      confirmState.onConfirm();
      setConfirmState(null);
    }
  };

  const handleCancel = () => {
    if (confirmState) {
      if (confirmState.onCancel) confirmState.onCancel();
      setConfirmState(null);
    }
  };

  const contextValue = {
    showNotification: addToast,
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    confirm: (options: ConfirmOptions) => setConfirmState(options),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="w-full max-w-md bg-white/95 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-7">
                 <div className={`w-12 h-12 flex items-center justify-center mb-5 border ${
                   confirmState.variant === 'danger' 
                     ? 'bg-rose-500/10 border-rose-500/5 text-rose-500' 
                     : 'bg-[#1E67FC]/10 border-[#1E67FC]/5 text-[#1E67FC]'
                 }`}>
                    {confirmState.variant === 'danger' ? <WarningCircle size={24} weight="duotone" /> : <Question size={24} weight="duotone" />}
                 </div>
                 <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-2">{confirmState.title}</h3>
                 <p className="text-[#475569] text-[13px] font-medium leading-relaxed">{confirmState.message}</p>
                  
                 <div className="grid grid-cols-2 gap-3 mt-6">
                    <button 
                       onClick={handleCancel}
                       className="h-11 text-slate-500 font-extrabold hover:bg-slate-50 hover:text-[#0F172A] border border-slate-200/60 transition-all text-[12px]"
                    >
                       {confirmState.cancelText || 'Cancel'}
                    </button>
                    <button 
                       onClick={handleConfirm}
                       className={`h-11 font-extrabold text-white transition-all text-[12px] ${
                         confirmState.variant === 'danger' 
                           ? 'bg-rose-500 hover:bg-rose-600' 
                           : 'bg-[#1E67FC] hover:bg-[#1E67FC]/90'
                       }`}
                    >
                       {confirmState.confirmText || 'Confirm'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
