'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Target, Lightning, UsersFour, Info } from '@phosphor-icons/react';

const GuidanceModal = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleTrigger = () => setActive(true);
    window.addEventListener('retrigger-uchms-guidance', handleTrigger);

    // Show guidance on first visit
    const hasSeenGuidance = localStorage.getItem('uchms-guidance-seen');
    if (!hasSeenGuidance) {
      const timer = setTimeout(() => setActive(true), 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('retrigger-uchms-guidance', handleTrigger);
      };
    }
    return () => window.removeEventListener('retrigger-uchms-guidance', handleTrigger);
  }, []);

  const dismiss = () => {
    setActive(false);
    localStorage.setItem('uchms-guidance-seen', 'true');
  };

  if (!active) return null;

  const directives = [
    {
      title: "Mission",
      description: "Connect all chapters in one network.",
      icon: Target,
      color: "text-indigo-500",
      bg: "bg-indigo-50"
    },
    {
      title: "Accuracy",
      description: "Keep financial and member data accurate.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Security",
      description: "Role-based access is enforced. Protect your login.",
      icon: Lightning,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      title: "Insights",
      description: "Use analytics to find chapters that need support.",
      icon: UsersFour,
      color: "text-blue-500",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-[620px] bg-white p-8 md:p-12 border border-black/5 relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Subtle Backdrop Glow highlights */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#EBF2FF]/30 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <button 
          onClick={dismiss} 
          className="absolute top-8 right-8 text-slate-400 hover:text-[#1E67FC] hover:rotate-90 transition-all duration-300 z-20 p-2"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="relative z-10">
          
          {/* Header Row */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-[#EBF2FF] text-[#1E67FC] flex items-center justify-center">
              <Info size={28} weight="fill" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1E67FC] block mb-1">Guide</span>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none">Welcome to CASA UENR</h2>
            </div>
          </div>

          <p className="text-slate-500 font-bold text-xs mb-8 leading-relaxed max-w-lg">
            Welcome. Here are some key points to get started:
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {directives.map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-slate-50 border border-black/5 hover:border-[#1E67FC]/10 hover:bg-white transition-all duration-300 group">
                <div className={`w-12 h-12 ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <item.icon size={22} weight="bold" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-[12px] text-[#0F172A] uppercase tracking-wide">{item.title}</h4>
                  <p className="text-slate-400 text-[10px] font-extrabold leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Acknowledge Button */}
          <button 
            onClick={dismiss}
            className="w-full bg-[#1E67FC] hover:bg-[#0F53D6] text-white h-14 font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Acknowledge & Continue
          </button>

        </div>
      </div>
    </div>
  );
};

export default GuidanceModal;
