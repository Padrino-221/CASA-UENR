'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlass,
  MapTrifold,
  Buildings,
  User,
  Command,
  X,
  ArrowRight
} from '@phosphor-icons/react';

import Link from 'next/link';

interface SearchResult {
  type: 'REGION' | 'CHAPTER' | 'MEMBER';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search/global?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'REGION': return <MapTrifold size={14} weight="duotone" />;
      case 'CHAPTER': return <Buildings size={14} weight="duotone" />;
      case 'MEMBER': return <User size={14} weight="duotone" />;
      default: return <MagnifyingGlass size={14} weight="duotone" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'REGION': return 'text-indigo-600 bg-indigo-50';
      case 'CHAPTER': return 'text-emerald-600 bg-emerald-50';
      case 'MEMBER': return 'text-violet-600 bg-violet-50';
      default: return 'text-slate-600 bg-bg-main';
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-4 h-12 bg-bg-main border border-transparent hover:border-standard cursor-pointer transition-all min-w-[320px] group overflow-hidden"
      >
        <MagnifyingGlass size={18} className="text-muted group-hover:text-primary transition-colors" weight="duotone" />
        <span className="text-sm font-bold text-muted">Search chapters or members...</span>
        <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-card border border-standard text-[9px] font-black text-muted">
           <Command size={10} weight="duotone" /> <span>K</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-0 left-0 w-full sm:w-[500px] bg-card border border-standard z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-standard flex items-center gap-3">
            <MagnifyingGlass size={18} className="text-primary" weight="duotone" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search regions, chapters, or students..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-700 text-sm"
            />
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-bg-main text-muted">
              <X size={18} weight="duotone" />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
            {query.length < 2 && (
              <div className="p-8 text-center">
                 <div className="w-12 h-12 bg-bg-main flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Command size={24} weight="duotone" />
                 </div>
                  <h4 className="font-bold text-slate-600 text-sm">Quick Search</h4>
                  <p className="text-xs text-muted mt-1">Type at least 2 characters to search.</p>
              </div>
            )}

            {isSearching && (
              <div className="p-8 text-center flex flex-col items-center">
                 <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Searching...</span>
              </div>
            )}

            {!isSearching && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                  <p className="text-sm font-bold text-muted uppercase tracking-widest">No matches found.</p>
              </div>
            )}

            {!isSearching && results.map((result) => (
              <Link 
                key={`${result.type}-${result.id}`} 
                href={result.link}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 hover:bg-bg-main transition-all group"
              >
                <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${getColor(result.type)}`}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 text-[13px] truncate">{result.title}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black text-muted uppercase tracking-wider">{result.type}</span>
                  </div>
                  <p className="text-[11px] font-bold text-muted truncate">{result.subtitle}</p>
                </div>
                <ArrowRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" weight="duotone" />
              </Link>
            ))}
          </div>

          <div className="p-4 bg-bg-main border-t border-standard flex justify-between items-center">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Search List</span>
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-muted px-1 bg-card border border-standard rounded">ESC</span>
                <span className="text-[9px] font-bold text-slate-300">to close</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
