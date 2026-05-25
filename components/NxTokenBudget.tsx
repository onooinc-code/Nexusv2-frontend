import React from 'react';
import { cn } from '@/lib/utils';

export interface NxTokenBudgetProps {
  used: number;
  total: number;
  className?: string;
}

export const NxTokenBudget = ({ used, total, className }: NxTokenBudgetProps) => {
  const percentage = Math.min(100, Math.max(0, (used / total) * 100));
  
  let statusColor = "bg-success";
  if (percentage > 85) statusColor = "bg-error";
  else if (percentage > 70) statusColor = "bg-warning";

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-mono">Tokens Used</span>
        <span className="text-gray-200 font-mono">{used.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className={cn("absolute top-0 left-0 h-full transition-all duration-500", statusColor)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
