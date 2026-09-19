'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useNotification } from '@/context/NotificationContext';
import { UploadSimple, ImageSquare, Trash, Check } from '@phosphor-icons/react';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export default function MediaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useNotification();

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/content/media');
      if (res.ok) setAssets(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/content/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const asset = await res.json();
        onChange(asset.url);
        setOpen(false);
        load();
      } else {
        const e = await res.json().catch(() => ({}));
        setError(e.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete image',
      message: 'This image will be permanently removed. This cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await fetch(`/api/content/media?id=${id}`, { method: 'DELETE' });
        load();
      },
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-24 h-16 border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageSquare size={22} className="text-[#94A3B8]" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-9 px-3 bg-primary text-white text-[12px] font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <UploadSimple size={14} weight="bold" />
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-9 px-3 bg-white border border-[#E2E8F0] text-[#0F172A] text-[12px] font-bold flex items-center gap-2"
          >
            <ImageSquare size={14} weight="bold" />
            Library
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="h-9 px-3 bg-white border border-[#E2E8F0] text-[#DC2626] text-[12px] font-bold"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Media library" maxWidth="max-w-4xl">
        {error && <p className="mb-4 text-sm font-bold text-[#DC2626]">{error}</p>}
        {assets.length === 0 ? (
          <p className="text-sm text-[#64748B] font-medium py-8 text-center">
            No images yet. Upload one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative border border-[#E2E8F0] bg-white">
                <button
                  type="button"
                  onClick={() => {
                    onChange(asset.url);
                    setOpen(false);
                  }}
                  className="block w-full aspect-[4/3] overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                </button>
                {value === asset.url && (
                  <span className="absolute top-1 left-1 bg-primary text-white p-1">
                    <Check size={12} weight="bold" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(asset.id)}
                  className="absolute top-1 right-1 bg-white/90 text-[#DC2626] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete image"
                >
                  <Trash size={13} weight="bold" />
                </button>
                <p className="px-2 py-1 text-[10px] text-[#64748B] font-medium truncate">{asset.filename}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
