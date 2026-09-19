'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { UploadSimple, Trash } from '@phosphor-icons/react';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useNotification();

  const load = useCallback(async () => {
    const res = await fetch('/api/content/media');
    if (res.ok) setAssets(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/content/upload', { method: 'POST', body: fd });
      if (res.ok) load();
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  const remove = (asset: MediaAsset) => {
    confirm({
      title: 'Delete image',
      message: `"${asset.filename}" will be permanently removed. This cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await fetch(`/api/content/media?id=${asset.id}`, { method: 'DELETE' });
        load();
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Media Library</h1>
          <p className="text-sm text-[#64748B] font-medium mt-1">Images uploaded through the CMS.</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-10 px-4 bg-primary text-white text-[12px] font-bold flex items-center gap-2 disabled:opacity-60"
        >
          <UploadSimple size={15} weight="bold" />
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="text-sm font-bold text-[#DC2626]">{error}</p>}

      {loading ? (
        <p className="text-sm text-[#94A3B8] font-medium">Loading…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-[#94A3B8] font-medium border border-dashed border-[#CBD5E1] p-10 text-center">
          No images uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="group border border-[#E2E8F0] bg-white">
              <div className="aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#0F172A] truncate">{asset.filename}</p>
                  <p className="text-[10px] text-[#94A3B8] font-medium">{(asset.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={() => remove(asset)} className="p-1.5 text-[#DC2626] shrink-0" aria-label="Delete">
                  <Trash size={15} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
