'use client';

import React from 'react';

export interface NxTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface NxTabsProps {
  tabs: NxTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'underline' | 'pills';
}

export const NxTabs: React.FC<NxTabsProps> = ({ 
  tabs, 
  activeTab, 
  onChange, 
  className = '', 
  variant = 'default' 
}) => {
  return (
    <div className={`flex items-center space-x-1 ${variant === 'underline' ? 'border-b border-white/10 pb-[-1px]' : ''} ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        let tabClasses = '';
        if (variant === 'default') {
          tabClasses = isActive 
            ? 'bg-nexus-primary/20 text-nexus-primary border-nexus-primary' 
            : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
          tabClasses += ' border transition-colors rounded-lg px-4 py-2 text-sm font-medium';
        } else if (variant === 'underline') {
          tabClasses = isActive 
            ? 'border-b-2 border-nexus-primary text-nexus-primary' 
            : 'border-b-2 border-transparent text-gray-400 hover:text-white hover:border-white/20';
          tabClasses += ' transition-colors px-4 py-3 text-sm font-medium';
        } else if (variant === 'pills') {
          tabClasses = isActive 
            ? 'bg-nexus-primary text-white shadow-lg shadow-nexus-primary/20' 
            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10';
          tabClasses += ' transition-all rounded-full px-4 py-2 text-sm font-medium';
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 ${tabClasses}`}
            aria-selected={isActive}
            role="tab"
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
