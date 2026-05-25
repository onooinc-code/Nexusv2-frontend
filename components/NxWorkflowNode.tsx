import React from 'react';
import { cn } from '@/lib/utils';
import { Play, Webhook, Waypoints, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface NxWorkflowNodeProps {
  title: string;
  type: 'trigger' | 'action' | 'condition' | 'agent';
  status?: 'pending' | 'running' | 'success' | 'error';
  className?: string;
  selected?: boolean;
}

export const NxWorkflowNode = ({ title, type, status = 'pending', selected, className }: NxWorkflowNodeProps) => {
  const TypeIcon = {
    trigger: Play,
    action: Webhook,
    condition: Waypoints,
    agent: Bot
  }[type];

  const colors = {
    trigger: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    action: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    condition: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    agent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <div className={cn(
      "w-48 bg-surface-dark/90 backdrop-blur border rounded-lg p-3 shadow-lg transition-all",
      selected ? "border-nexus-blue ring-2 ring-nexus-blue/20" : "border-white/10 hover:border-white/20",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-md border", colors[type])}>
          <TypeIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs tracking-wider uppercase font-semibold text-gray-500">
          {type}
        </span>
        
        {status === 'success' && <CheckCircle2 className="w-3 h-3 text-success ml-auto shrink-0" />}
        {status === 'error' && <AlertCircle className="w-3 h-3 text-error ml-auto shrink-0" />}
        {status === 'running' && (
          <div className="ml-auto shrink-0 flex gap-0.5">
            <span className="w-1 h-1 bg-nexus-blue rounded-full animate-bounce" />
            <span className="w-1 h-1 bg-nexus-blue rounded-full animate-bounce delay-75" />
            <span className="w-1 h-1 bg-nexus-blue rounded-full animate-bounce delay-150" />
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-gray-200 line-clamp-2">
        {title}
      </div>
    </div>
  );
};
