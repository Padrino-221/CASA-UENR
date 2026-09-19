'use client';

import React, { useMemo, useState } from 'react';
import type { CmsPage } from '@/lib/cms/schema';
import FieldInput from './FieldInput';
import Modal from '@/components/ui/Modal';
import { useNotification } from '@/context/NotificationContext';
import {
  FloppyDisk,
  Eye,
  ArrowClockwise,
  UploadSimple,
  CaretDown,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';

type Status = 'idle' | 'saving' | 'saved' | 'published' | 'error';

export default function ContentEditor({
  page,
  initialContent,
}: {
  page: CmsPage;
  initialContent: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialContent);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(page.sections.map((s) => [s.key, true]))
  );
  const { confirm } = useNotification();

  const previewUrl = useMemo(
    () => `${page.path}${page.path.includes('?') ? '&' : '?'}preview=1&_=${previewNonce}`,
    [page.path, previewNonce]
  );

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (status === 'saved' || status === 'published') setStatus('idle');
  };

  const save = async (publish: boolean): Promise<boolean> => {
    setStatus('saving');
    setMessage('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page.slug, action: publish ? 'publish' : 'save', values }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      if (data.content) setValues(data.content);
      setStatus(publish ? 'published' : 'saved');
      setMessage(publish ? 'Published — changes are live.' : 'Draft saved.');
      return true;
    } catch {
      setStatus('error');
      setMessage('Could not save. Please try again.');
      return false;
    }
  };

  const reset = (section?: string) => {
    const label = section ? 'this section' : 'this entire page';
    confirm({
      title: 'Reset content',
      message: `Reset ${label} to the default content? This cannot be undone.`,
      variant: 'danger',
      confirmText: 'Reset',
      onConfirm: async () => {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: page.slug, action: 'reset', section }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.content) setValues(data.content);
          setStatus('idle');
          setMessage('Reset to defaults.');
        }
      },
    });
  };

  const openPreview = async () => {
    const ok = await save(false);
    if (!ok) return;
    setPreviewNonce((n) => n + 1);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-white border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={status === 'saving'}
            className="h-10 px-4 bg-white border border-[#E2E8F0] text-[#0F172A] text-[12px] font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <FloppyDisk size={15} weight="bold" />
            Save draft
          </button>
          <button
            type="button"
            onClick={openPreview}
            disabled={status === 'saving'}
            className="h-10 px-4 bg-white border border-[#E2E8F0] text-[#0F172A] text-[12px] font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <Eye size={15} weight="bold" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={status === 'saving'}
            className="h-10 px-4 bg-primary text-white text-[12px] font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <UploadSimple size={15} weight="bold" />
            {status === 'saving' ? 'Saving…' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="h-10 px-4 bg-white border border-[#E2E8F0] text-[#DC2626] text-[12px] font-bold flex items-center gap-2"
          >
            <ArrowClockwise size={15} weight="bold" />
            Reset page
          </button>
        </div>
        <div className="text-[12px] font-bold">
          {status === 'saved' && <span className="text-[#059669] flex items-center gap-1.5"><CheckCircle size={14} weight="fill" /> {message}</span>}
          {status === 'published' && <span className="text-[#059669] flex items-center gap-1.5"><CheckCircle size={14} weight="fill" /> {message}</span>}
          {status === 'error' && <span className="text-[#DC2626] flex items-center gap-1.5"><WarningCircle size={14} weight="fill" /> {message}</span>}
          {status === 'idle' && <span className="text-[#94A3B8]">Unsaved changes are not visible on the live site.</span>}
        </div>
      </div>

      {/* Sections */}
      {page.sections.map((section) => {
        const isOpen = openSections[section.key] !== false;
        return (
          <div key={section.key} className="border border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setOpenSections((prev) => ({ ...prev, [section.key]: !isOpen }))}
                className="flex items-center gap-3 text-left"
              >
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`text-[#64748B] transition-transform ${isOpen ? '' : '-rotate-90'}`}
                />
                <span>
                  <span className="block text-[15px] font-black text-[#0F172A] tracking-tight">{section.label}</span>
                  {section.description && (
                    <span className="block text-[12px] text-[#64748B] font-medium mt-0.5">{section.description}</span>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => reset(section.key)}
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8] hover:text-[#DC2626]"
              >
                Reset
              </button>
            </div>

            {isOpen && (
              <div className="p-5 space-y-5">
                {section.fields.map((field) => {
                  const key = `${section.key}.${field.key}`;
                  return (
                    <div key={field.key}>
                      <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">
                        {field.label}
                      </label>
                      <FieldInput field={field} value={values[key] ?? ''} onChange={(v) => setValue(key, v)} />
                      {field.help && <p className="mt-1.5 text-[11px] text-[#94A3B8] font-medium">{field.help}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Preview modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Preview — ${page.title}`}
        description="This is how the page looks with your saved draft."
        maxWidth="max-w-6xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setPreviewNonce((n) => n + 1)}
            className="h-9 px-3 bg-white border border-[#E2E8F0] text-[#0F172A] text-[12px] font-bold flex items-center gap-2"
          >
            <ArrowClockwise size={14} weight="bold" />
            Reload preview
          </button>
          <a
            href={page.path}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 bg-white border border-[#E2E8F0] text-primary text-[12px] font-bold flex items-center"
          >
            Open live page
          </a>
        </div>
        <iframe
          key={previewNonce}
          src={previewUrl}
          title="Preview"
          className="w-full h-[70vh] border border-[#E2E8F0] bg-white"
        />
      </Modal>
    </div>
  );
}
