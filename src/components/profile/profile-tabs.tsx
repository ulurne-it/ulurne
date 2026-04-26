'use client';

import { motion } from 'framer-motion';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'laboratory', label: 'Laboratory' },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <div className="flex items-center justify-center border-b border-white/5 mb-8">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-8 py-4 transition-all duration-300 group`}
          >
            <span className={`text-[10px] font-black uppercase tracking-[0.25em] transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white'
            }`}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="profile-tab-active"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
