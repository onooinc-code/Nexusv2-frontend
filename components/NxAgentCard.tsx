"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';
import { NxStatusBadge } from './NxStatusBadge';
import { Brain, Activity, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

export interface NxAgentCardProps {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline' | 'error';
  tokenUsage?: number;
  className?: string;
  onClick?: (id: string) => void;
}

export const NxAgentCard = ({ id, name, role, status, tokenUsage, className, onClick }: NxAgentCardProps) => {
  const badgeStatus = {
    online: 'success',
    busy: 'warning',
    offline: 'neutral',
    error: 'danger'
  } as const;

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="h-full"
    >
      <NxGlassCard 
        className={cn(
          "flex flex-col p-5 group transition-all duration-300 hover:border-nexus-blue/30 cursor-pointer overflow-hidden relative h-full",
          className
        )}
        onClick={() => onClick?.(id)}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-nexus-blue/10 rounded-full blur-3xl group-hover:bg-nexus-blue/20 transition-colors" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-nexus-blue/20 transition-shadow">
              <Brain className="w-5 h-5 text-nexus-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 group-hover:text-white transition-colors">{name}</h3>
              <p className="text-xs text-gray-400 font-medium tracking-wide">{role}</p>
            </div>
          </div>
          <NxStatusBadge status={badgeStatus[status]} label={status.toUpperCase()} dot />
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 relative z-10">
          {tokenUsage !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black/20 p-2 rounded-md">
              <Activity className="w-3.5 h-3.5 text-nexus-blue" />
              <span className="font-mono">{tokenUsage.toLocaleString()} tkns</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black/20 p-2 rounded-md ml-auto hover:text-white transition-colors">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Config</span>
          </div>
        </div>
      </NxGlassCard>
    </motion.div>
  );
};

