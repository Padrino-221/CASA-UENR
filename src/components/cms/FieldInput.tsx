'use client';

import React, { useState } from 'react';
import type { CmsField } from '@/lib/cms/schema';
import MediaPicker from './MediaPicker';
import { useNotification } from '@/context/NotificationContext';
import { Plus, Trash, ArrowUp, ArrowDown, X } from '@phosphor-icons/react';

const inputCls =
  'w-full min-h-[44px] px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:border-primary focus:outline-none transition-colors';

function safeParse(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CmsField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === 'text') {
    return (
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        rows={4}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} leading-relaxed`}
      />
    );
  }

  if (field.type === 'image') {
    return <MediaPicker value={value} onChange={onChange} />;
  }

  if (field.type === 'tags') {
    return <TagsInput value={value} onChange={onChange} />;
  }

  if (field.type === 'list') {
    return <ListInput field={field} value={value} onChange={onChange} />;
  }

  return null;
}

function TagsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tags = safeParse(value).filter((t): t is string => typeof t === 'string');
  const [draft, setDraft] = useState('');

  const commit = () => {
    const next = draft.trim();
    if (next && !tags.includes(next)) onChange(JSON.stringify([...tags, next]));
    setDraft('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border border-[#E2E8F0] bg-white p-2 min-h-[44px]">
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 bg-[#EFF6FF] text-primary text-[12px] font-bold px-2 py-1">
          {tag}
          <button
            type="button"
            onClick={() => onChange(JSON.stringify(tags.filter((_, i) => i !== index)))}
            aria-label={`Remove ${tag}`}
          >
            <X size={11} weight="bold" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder="Add tag…"
        className="flex-1 min-w-[120px] text-sm font-medium outline-none px-1 py-1"
      />
    </div>
  );
}

function ListInput({
  field,
  value,
  onChange,
}: {
  field: CmsField;
  value: string;
  onChange: (v: string) => void;
}) {
  const items = safeParse(value) as Record<string, string>[];
  const subFields = field.subFields ?? [];
  const { confirm } = useNotification();

  const update = (next: Record<string, string>[]) => onChange(JSON.stringify(next));

  const setItemField = (index: number, key: string, val: string) => {
    update(items.map((item, i) => (i === index ? { ...item, [key]: val } : item)));
  };

  const addItem = () => {
    const blank: Record<string, string> = {};
    subFields.forEach((sf) => (blank[sf.key] = ''));
    update([...items, blank]);
  };

  const removeItem = (index: number) => {
    confirm({
      title: 'Remove item',
      message: 'This item will be removed from the list.',
      variant: 'danger',
      confirmText: 'Remove',
      onConfirm: () => update(items.filter((_, i) => i !== index)),
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
              {(field.itemLabelKey && item[field.itemLabelKey]) || `Item ${index + 1}`}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(index, -1)} className="p-1.5 text-[#64748B] hover:text-primary" aria-label="Move up">
                <ArrowUp size={13} weight="bold" />
              </button>
              <button type="button" onClick={() => move(index, 1)} className="p-1.5 text-[#64748B] hover:text-primary" aria-label="Move down">
                <ArrowDown size={13} weight="bold" />
              </button>
              <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-[#DC2626]" aria-label="Remove item">
                <Trash size={13} weight="bold" />
              </button>
            </div>
          </div>
          {subFields.map((sf) => (
            <div key={sf.key}>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">{sf.label}</label>
              {sf.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={item[sf.key] ?? ''}
                  placeholder={sf.placeholder}
                  onChange={(e) => setItemField(index, sf.key, e.target.value)}
                  className={`${inputCls} leading-relaxed`}
                />
              ) : sf.type === 'image' ? (
                <MediaPicker value={item[sf.key] ?? ''} onChange={(url) => setItemField(index, sf.key, url)} />
              ) : (
                <input
                  type="text"
                  value={item[sf.key] ?? ''}
                  placeholder={sf.placeholder}
                  onChange={(e) => setItemField(index, sf.key, e.target.value)}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="h-10 px-4 bg-white border border-dashed border-[#CBD5E1] text-[#0F172A] text-[12px] font-bold flex items-center gap-2 hover:border-primary hover:text-primary"
      >
        <Plus size={14} weight="bold" />
        Add item
      </button>
    </div>
  );
}
