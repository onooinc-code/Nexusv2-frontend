import React from 'react';
import { cn } from '@/lib/utils';
import { Database, Clock, BrainCircuit } from 'lucide-react';

export interface NxMemoryChipProps {
  label: string;
  type?: 'semantic' | 'episodic' | 'working';
  relevance?: number; // 0 to 1
  className?: string;
}

export const NxMemoryChip = ({ label, type = 'semantic', relevance, className }: NxMemoryChipProps) => {
  const TypeIcon = {
    semantic: Database,
    episodic: Clock,
    working: BrainCircuit
  }[type];

  const colors = {
    semantic: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    episodic: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    working: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  }[type];

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-medium",
      colors,
      className
    )}>
      <TypeIcon className="w-3 h-3" />
      <span className="max-w-[150px] truncate">{label}</span>
      
      {relevance !== undefined && (
        <span className="ml-1 text-[10px] opacity-70 bg-black/20 px-1 rounded">
          {Math.round(relevance * 100)}%
        </span>
      )}
    </div>
  );
};
