'use client';
import { useCallback, useEffect, useId, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import Portal from './Portal';
import './admin-controls.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  overflowVisible?: boolean;
}

export default function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg', overflowVisible = false }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const attachPanel = useCallback((node: HTMLDivElement | null) => { panel.current = node; node?.focus(); }, []);
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (event.target instanceof Element && event.target.closest('[data-admin-floating]'))) return;
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]') || []).filter(item => item.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) { event.preventDefault(); panel.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <Portal><div className="admin-dialog">
    <div className="admin-dialog-backdrop" onClick={onClose} aria-hidden="true"/>
    <div ref={attachPanel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : 'Dialog'} aria-describedby={description ? descriptionId : undefined} className={cn('admin-dialog-panel', maxWidth, overflowVisible && 'admin-dialog-overflow')}>
      <header className="admin-dialog-header"><div>{title && <h2 id={titleId}>{title}</h2>}{description && <p id={descriptionId}>{description}</p>}</div><button type="button" className="admin-dialog-close" aria-label="Close dialog" onClick={onClose}><X size={21}/></button></header>
      <div className={cn('admin-dialog-body', overflowVisible && 'admin-dialog-overflow')}>{children}</div>
    </div>
  </div></Portal>;
}
