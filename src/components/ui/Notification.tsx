'use client';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';
import './admin-controls.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
interface ToastProps { id: string; message: string; type: NotificationType; duration: number; onClose: () => void; }

export const Toast = ({ message, type, duration, onClose }: ToastProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [exiting, setExiting] = useState(false);
  const remaining = useRef(duration);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    if (exiting) { const timer = setTimeout(() => close.current(), 160); return () => clearTimeout(timer); }
    if (hovered || focused || duration <= 0) return;
    const started = Date.now();
    const timer = setTimeout(() => setExiting(true), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (Date.now() - started)); };
  }, [hovered, focused, duration, exiting]);
  const Icon = { success: CheckCircle, error: XCircle, warning: Warning, info: Info }[type];
  const title = { success: 'Success', error: 'Something went wrong', warning: 'Please check', info: 'Update' }[type];
  return <div role={type === 'error' ? 'alert' : 'status'} className={`admin-toast admin-toast-${type} ${exiting ? 'is-exiting' : ''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <span className="admin-toast-icon"><Icon size={22} weight="duotone" /></span>
    <div className="admin-toast-copy"><strong>{title}</strong><p>{message}</p></div>
    <button type="button" aria-label="Dismiss notification" onClick={() => setExiting(true)}><X size={17} /></button>
    {duration > 0 && <span className="admin-toast-timer" aria-hidden="true"><span style={{ animationDuration: `${duration}ms`, animationPlayState: hovered || focused ? 'paused' : 'running' }} /></span>}
  </div>;
};
