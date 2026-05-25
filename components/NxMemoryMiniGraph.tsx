"use client";

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Brain, LayoutGrid, Award } from 'lucide-react';

export interface NxMemoryMiniGraphProps {
  data: {
    semantic: number;
    episodic: number;
    working: number;
  };
  totalCount: number;
  className?: string;
}

export const NxMemoryMiniGraph = ({ data, totalCount, className }: NxMemoryMiniGraphProps) => {
  const { semantic = 0, episodic = 0, working = 0 } = data;
  const total = totalCount || (semantic + episodic + working) || 1;

  const pctSemantic = Math.round((semantic / total) * 100);
  const pctEpisodic = Math.round((episodic / total) * 100);
  const pctWorking = Math.round((working / total) * 100);

  const stats = [
    { label: "Semantic", count: semantic, pct: pctSemantic, color: "bg-nexus-blue border-nexus-blue/40", text: "text-nexus-blue", desc: "Permanent structured heuristics & rules" },
    { label: "Episodic", count: episodic, pct: pctEpisodic, color: "bg-hedral-purple border-hedral-purple/40", text: "text-hedral-purple", desc: "Historic interaction events & timelines" },
    { label: "Working", count: working, pct: pctWorking, color: "bg-amber-400 border-amber-400/40", text: "text-amber-400", desc: "Volatile conversational state & variables" },
  ];

  return (
    <div className={cn("p-5 bg-black/10 rounded-xl border border-white/5 flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
          <Brain className="w-3.5 h-3.5 text-hedral-purple animate-pulse" />
          <span>MEMORY TAXONOMY SPECTRUM</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">{total} Items Loaded</span>
      </div>

      {/* Visual Bar Graph breakdown */}
      <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
        {semantic > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctSemantic}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-nexus-blue"
            title={`Semantic: ${pctSemantic}%`}
          />
        )}
        {episodic > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctEpisodic}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="h-full bg-hedral-purple"
            title={`Episodic: ${pctEpisodic}%`}
          />
        )}
        {working > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctWorking}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-amber-400"
            title={`Working: ${pctWorking}%`}
          />
        )}
      </div>

      {/* Details list */}
      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5 group">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", stat.color)} />
                <span className="font-semibold text-gray-200">{stat.label}</span>
              </div>
              <div className="font-mono text-gray-400 text-xs">
                <span className={cn("font-bold mr-1.5", stat.text)}>{stat.count} items</span>
                <span>({stat.pct}%)</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 pl-4 group-hover:text-gray-400 transition-colors">
              {stat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
