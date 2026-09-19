'use client';

import React from 'react';
import {
  X,
  BookOpen,
  Shield,
  Lifebuoy,
  MapTrifold,
  Buildings,
  CalendarBlank,
  Wallet,
  CheckSquare,
  StackSimple
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import Portal from './ui/Portal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const role = session?.user?.role || 'NATIONAL_ADMIN';

  if (!isOpen) return null;

  const headerConfigs: Record<string, { title: string; subtitle: string }> = {
    NATIONAL_ADMIN: {
      title: "National Admin Guide",
      subtitle: "Manage the system and all chapters"
    },
    REGIONAL_ADMIN: {
      title: "Regional Admin Guide",
      subtitle: "Manage your region's chapters"
    },
    LOCAL_ADMIN: {
      title: "Local Admin Guide",
      subtitle: "Manage your chapter"
    }
  };

  const currentHeader = headerConfigs[role] || headerConfigs.NATIONAL_ADMIN;

  const roleSections: Record<string, Array<{ title: string; icon: React.ReactNode; items: string[] }>> = {
    NATIONAL_ADMIN: [
      {
        title: "Governance",
        icon: <Shield className="text-[#1E67FC]" weight="duotone" />,
        items: [
          "Manage regions and coordinators.",
          "Add new chapters and assign leaders.",
          "Monitor activity logs."
        ]
      },
      {
        title: "Finance",
        icon: <Wallet className="text-amber-500" weight="duotone" />,
        items: [
          "View finance records from all regions.",
          "Export reports.",
          "Search members or chapters."
        ]
      },
      {
        title: "Academic Oversight",
        icon: <CalendarBlank className="text-emerald-500" weight="duotone" />,
        items: [
          "Review academic cycle status across regions.",
          "View active years and chapter calendars.",
          "Data is kept separate by region."
        ]
      },
      {
        title: "System Integrity",
        icon: <StackSimple className="text-violet-500" weight="duotone" />,
        items: [
          "Manage admin roles and access.",
          "Check system health in Activity Logs.",
          "Enforce role-based access across the portal."
        ]
      }
    ],
    REGIONAL_ADMIN: [
      {
        title: "Regional Admin",
        icon: <MapTrifold className="text-[#1E67FC]" weight="duotone" />,
        items: [
          "Monitor chapters and members in your region.",
          "View growth metrics across chapters.",
          "Your access is limited to your region."
        ]
      },
      {
        title: "Resources",
        icon: <Wallet className="text-amber-500" weight="duotone" />,
        items: [
          "Track finance from chapters in your region.",
          "Download member and financial rosters.",
          "Search members within your region."
        ]
      },
      {
        title: "Engagement",
        icon: <CheckSquare className="text-emerald-500" weight="duotone" />,
        items: [
          "Review attendance and participation trends.",
          "Create and oversee regional events.",
          "Track student progress in your region."
        ]
      },
      {
        title: "Compliance",
        icon: <Shield className="text-violet-500" weight="duotone" />,
        items: [
          "Manage local admin accounts for your region.",
          "Cannot access other regions' data.",
          "Generate reports for national."
        ]
      }
    ],
    LOCAL_ADMIN: [
      {
        title: "Chapter Hub",
        icon: <Buildings className="text-[#1E67FC]" weight="duotone" />,
        items: [
          "Add new members and update contact details.",
          "Log attendance and monitor engagement.",
          "Search profiles within your chapter."
        ]
      },
      {
        title: "Finance",
        icon: <Wallet className="text-amber-500" weight="duotone" />,
        items: [
          "Register tithes, offerings, and donations.",
          "Upload CSV for batch imports.",
          "Ensure collections are categorized correctly."
        ]
      },
      {
        title: "Activities",
        icon: <CalendarBlank className="text-emerald-500" weight="duotone" />,
        items: [
          "Schedule chapter events and meetings.",
          "Track student leaders.",
          "Track participation across terms."
        ]
      },
      {
        title: "Data Integrity",
        icon: <Shield className="text-violet-500" weight="duotone" />,
        items: [
          "Your data is limited to your chapter.",
          "Keep chapter records up to date.",
          "Keep your device secure."
        ]
      }
    ]
  };

  const sections = roleSections[role] || roleSections.NATIONAL_ADMIN;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl bg-white border border-slate-100 relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#EBF2FF] flex items-center justify-center text-[#1E67FC]">
                <Lifebuoy size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">{currentHeader.title}</h2>
                <p className="text-[12px] font-bold text-[#94A3B8]">{currentHeader.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 hover:bg-slate-100 flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-all"
            >
              <X size={18} weight="duotone" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F4F7FC] flex items-center justify-center">
                      {section.icon}
                    </div>
                    <h3 className="font-extrabold text-[#0F172A] text-[14px]">{section.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-[12.5px] text-[#475569] leading-relaxed font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1E67FC]/30 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center shrink-0">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('retrigger-uchms-guidance'));
                onClose();
              }}
              className="text-[#1E67FC] hover:text-[#1E67FC]/80 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <BookOpen size={16} weight="duotone" />
              <span>Review Guidelines</span>
            </button>
            <button
              onClick={onClose}
              className="bg-[#1E67FC] hover:bg-[#1E67FC]/90 text-white px-7 py-2.5 font-extrabold text-[12px] tracking-wide transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default HelpModal;
