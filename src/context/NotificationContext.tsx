'use client';
import {
  WarningCircle,
  Question
} from '@phosphor-icons/react';

import Modal from '@/components/ui/Modal';
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
      <div className="fixed top-5 right-5 left-5 sm:left-auto z-[3000] flex flex-col gap-3 pointer-events-none">
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

      {confirmState && <Modal isOpen onClose={handleCancel} title={confirmState.title} maxWidth="max-w-md">
        <div className={`admin-confirm-icon ${confirmState.variant === 'danger' ? 'admin-confirm-icon-danger' : ''}`}>
          {confirmState.variant === 'danger' ? <WarningCircle size={25}/> : <Question size={25}/>}
        </div>
        <p className="admin-confirm-message">{confirmState.message}</p>
        <div className="admin-confirm-actions">
          <button type="button" onClick={handleCancel}>{confirmState.cancelText || 'Cancel'}</button>
          <button type="button" onClick={handleConfirm} className={confirmState.variant === 'danger' ? 'admin-confirm-danger' : 'admin-confirm-primary'}>{confirmState.confirmText || 'Confirm'}</button>
        </div>
      </Modal>}

    </NotificationContext.Provider>
  );
};
