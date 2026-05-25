import React from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface NxQueuePillProps {
  count: number;
  label?: string;
  className?: string;
}

export const NxQueuePill = ({ count, label = "in queue", className }: NxQueuePillProps) => {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-dark border border-white/10 text-xs font-medium text-gray-300", className)}>
      <Clock className="w-3.5 h-3.5 text-nexus-blue" />
      <span>{count}</span>
      <span className="text-gray-500 hidden sm:inline">{label}</span>
    </div>
  );
};
