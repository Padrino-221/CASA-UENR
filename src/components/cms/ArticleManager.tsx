'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import MediaPicker from './MediaPicker';
import { useNotification } from '@/context/NotificationContext';
import { Plus, PencilSimple, Trash, Eye, EyeSlash } from '@phosphor-icons/react';

const KIND_OPTIONS = ['Recap', 'Testimony', 'Announcement', 'News'].map((kind) => ({
  label: kind,
  value: kind,
}));

interface Article {
  id: string;
  slug: string;
  kind: string;
  title: string;
  excerpt: string;
  body: string;
  quoteText: string | null;
  quoteCite: string | null;
  imageUrl: string | null;
  meta: string | null;
  published: boolean;
  order: number;
}

const EMPTY = {
  title: '',
  kind: 'Recap',
  slug: '',
  excerpt: '',
  bodyText: '',
  quoteText: '',
  quoteCite: '',
  imageUrl: '',
  meta: '',
  published: true,
  order: 0,
};

const inputCls =
  'w-full min-h-[44px] px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:border-primary focus:outline-none';

export default function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');
  const { confirm } = useNotification();

  const load = useCallback(async () => {
    const res = await fetch('/api/content/articles');
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError('');
    setOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      kind: article.kind,
      slug: article.slug,
      excerpt: article.excerpt,
      bodyText: (JSON.parse(article.body || '[]') as string[]).join('\n\n'),
      quoteText: article.quoteText ?? '',
      quoteCite: article.quoteCite ?? '',
      imageUrl: article.imageUrl ?? '',
      meta: article.meta ?? '',
      published: article.published,
      order: article.order,
    });
    setError('');
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title,
      kind: form.kind,
      slug: form.slug,
      excerpt: form.excerpt,
      body: form.bodyText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      quoteText: form.quoteText,
      quoteCite: form.quoteCite,
      imageUrl: form.imageUrl,
      meta: form.meta,
      published: form.published,
      order: form.order,
    };
    const res = await fetch(editingId ? `/api/content/articles/${editingId}` : '/api/content/articles', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save article');
    }
  };

  const remove = (article: Article) => {
    confirm({
      title: 'Delete article',
      message: `"${article.title}" will be permanently removed. This cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await fetch(`/api/content/articles/${article.id}`, { method: 'DELETE' });
        load();
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">News & Articles</h1>
          <p className="text-sm text-[#64748B] font-medium mt-1">Write recaps, testimonies, and announcements.</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 bg-primary text-white text-[12px] font-bold flex items-center gap-2">
          <Plus size={15} weight="bold" />
          New article
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#94A3B8] font-medium">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-[#94A3B8] font-medium border border-dashed border-[#CBD5E1] p-10 text-center">
          No articles yet. Create your first one.
        </p>
      ) : (
        <div className="border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0]">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center gap-4 p-4">
              <div className="w-16 h-12 bg-[#F1F5F9] overflow-hidden shrink-0">
                {article.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">{article.kind}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${article.published ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight truncate">{article.title}</h3>
                <p className="text-[12px] text-[#64748B] font-medium truncate">{article.excerpt}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(article)} className="p-2 text-[#64748B] hover:text-primary" aria-label="Edit">
                  <PencilSimple size={16} weight="bold" />
                </button>
                <button onClick={() => remove(article)} className="p-2 text-[#DC2626]" aria-label="Delete">
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editingId ? 'Edit article' : 'New article'} maxWidth="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm font-bold text-[#DC2626]">{error}</p>}
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Title</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CustomDropdown
              label="Kind"
              options={KIND_OPTIONS}
              value={form.kind}
              onChange={(value) => setForm({ ...form, kind: value })}
            />
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Slug (optional)</label>
              <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Excerpt</label>
            <textarea className={inputCls} rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Body</label>
            <textarea className={inputCls} rows={7} value={form.bodyText} onChange={(e) => setForm({ ...form, bodyText: e.target.value })} />
            <p className="mt-1.5 text-[11px] text-[#94A3B8] font-medium">Separate paragraphs with a blank line.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Quote</label>
              <input className={inputCls} value={form.quoteText} onChange={(e) => setForm({ ...form, quoteText: e.target.value })} />
            </div>
            <div>
              <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Quote reference</label>
              <input className={inputCls} value={form.quoteCite} onChange={(e) => setForm({ ...form, quoteCite: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Meta</label>
            <input className={inputCls} value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Evangelism Department · Sep 12" />
          </div>
          <div>
            <label className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#475569] mb-2">Cover image</label>
            <MediaPicker value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
            <span className="text-[13px] font-bold text-[#0F172A] flex items-center gap-1.5">
              {form.published ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
              Published
            </span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-5 text-[12px] font-bold text-[#64748B]">
              Cancel
            </button>
            <button type="submit" className="h-11 px-6 bg-primary text-white text-[12px] font-bold">
              {editingId ? 'Save changes' : 'Create article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
