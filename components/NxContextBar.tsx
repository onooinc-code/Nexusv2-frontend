import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface ContextAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface NxContextBarProps {
  title: string;
  breadcrumbs?: { label: string; href: string }[];
  actions?: ContextAction[];
  className?: string;
}

export const NxContextBar = ({ title, breadcrumbs = [], actions = [], className }: NxContextBarProps) => {
  return (
    <div className={cn("h-12 border-b border-white/10 flex items-center justify-between px-6 bg-deep-space/50 shrink-0 backdrop-blur-md", className)}>
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <Link href={crumb.href} className="text-gray-400 hover:text-white transition-colors">
              {crumb.label}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </React.Fragment>
        ))}
        <span className="text-gray-100 font-medium">{title}</span>
      </div>
      
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-md flex items-center gap-1.5 transition-colors text-gray-200"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
