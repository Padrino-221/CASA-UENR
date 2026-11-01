'use client';

import React from 'react';
import {
  BookOpen,
  Shield,
  MapTrifold,
  Buildings,
  CalendarBlank,
  Wallet,
  CheckSquare,
  StackSimple
} from '@phosphor-icons/react';

import { useSession } from 'next-auth/react';
import Modal from './ui/Modal';

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

  return <Modal isOpen={isOpen} onClose={onClose} title={currentHeader.title} description={currentHeader.subtitle} maxWidth="max-w-4xl">
    <div className="admin-guide-grid">{sections.map(section => <section key={section.title} className="admin-guide-card"><div className="mb-3">{section.icon}</div><h3>{section.title}</h3><ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
    <div className="admin-guide-actions"><button type="button" onClick={() => { window.dispatchEvent(new CustomEvent('retrigger-uchms-guidance')); onClose(); }}><BookOpen size={17} aria-hidden="true" className="inline mr-2"/>Review guidelines</button><button type="button" onClick={onClose}>Done</button></div>
  </Modal>;
};

export default HelpModal;
