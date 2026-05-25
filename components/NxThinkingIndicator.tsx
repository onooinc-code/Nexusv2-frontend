import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface NxThinkingIndicatorProps {
  label?: string;
  className?: string;
}

export const NxThinkingIndicator = ({ label = "Thinking...", className }: NxThinkingIndicatorProps) => {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-nexus-blue/80", className)}>
      <Sparkles className="w-4 h-4 animate-pulse" />
      <span className="font-medium animate-pulse">{label}</span>
      <div className="flex gap-1 ml-1">
        <span className="w-1.5 h-1.5 bg-nexus-blue/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-nexus-blue/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-nexus-blue/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};
