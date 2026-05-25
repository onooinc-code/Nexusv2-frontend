import React from 'react';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';

export interface IntentItem {
  id: string;
  label: string;
  confidence: number; // 0-100
  color?: string;
}

export interface NxIntentGridProps {
  intents: IntentItem[];
  className?: string;
  title?: string;
}

export const NxIntentGrid = ({ intents, title = "Top Intents", className }: NxIntentGridProps) => {
  return (
    <NxGlassCard className={cn("flex flex-col", className)} padding="sm">
      {title && <h3 className="text-gray-100 font-medium text-sm mb-3 px-2">{title}</h3>}
      <div className="flex flex-col gap-2 relative">
        {intents.map((intent) => (
          <div key={intent.id} className="relative flex items-center h-8 rounded-md overflow-hidden bg-white/5 border border-white/5 group">
            {/* Background progress bar */}
            <div 
              className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-out opacity-20", intent.color || "bg-nexus-blue")} 
              style={{ width: `${intent.confidence}%` }}
            />
            {/* Content */}
            <div className="relative flex items-center justify-between w-full px-3 text-xs">
              <span className="text-gray-200 truncate">{intent.label}</span>
              <span className="font-mono text-gray-400 group-hover:text-gray-200 transition-colors">
                {intent.confidence}%
              </span>
            </div>
          </div>
        ))}
        {intents.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-4">No intents detected</div>
        )}
      </div>
    </NxGlassCard>
  );
};
