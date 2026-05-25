"use client";

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Sparkles, Calendar } from 'lucide-react';

export interface NxActivityHeatmapProps {
  className?: string;
}

export const NxActivityHeatmap = ({ className }: NxActivityHeatmapProps) => {
  // Simulate 12 weeks * 7 days grid (84 blocks) of system activities
  // Generate a deterministic but interesting sequence of logs intensity (0-4)
  const blocks = Array.from({ length: 84 }, (_, i) => {
    const daySeed = (i * 17) % 31;
    let level = 0;
    if (daySeed > 25) level = 4; // high intensity
    else if (daySeed > 18) level = 3;
    else if (daySeed > 10) level = 2;
    else if (daySeed > 4) level = 1;
    return { day: i, level, count: level * Math.floor(6 + (i % 5) * 3) };
  });

  const levelColors = [
    "bg-white/5 border-white/5", // zero activity
    "bg-nexus-blue/15 border-nexus-blue/10", // low
    "bg-nexus-blue/30 border-nexus-blue/20", // medium-low
    "bg-nexus-blue/50 border-nexus-blue/30", // medium-high
    "bg-nexus-blue text-[#ffffff] border-nexus-blue/60" // peak activity
  ];

  return (
    <div className={cn("p-5 bg-black/15 rounded-xl border border-white/10 flex flex-col gap-4", className)}>
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-nexus-blue animate-pulse" />
          <span>COGNITIVE TRACE ACTIVITY</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
          <span>Less</span>
          <div className="w-2 h-2 rounded bg-white/5" />
          <div className="w-2 h-2 rounded bg-nexus-blue/20" />
          <div className="w-2 h-2 rounded bg-nexus-blue/45" />
          <div className="w-2 h-2 rounded bg-nexus-blue" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 py-1 justify-center max-w-full overflow-x-auto scrollbar-thin">
        {blocks.map((b) => (
          <motion.div
            key={b.day}
            whileHover={{ scale: 1.25, zIndex: 10 }}
            className={cn(
              "w-3 h-3 rounded-[3px] border transition-all duration-300 relative cursor-pointer",
              levelColors[b.level]
            )}
            title={`Telemetry Day ${b.day + 1}: ${b.count} events logged`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1">
        <span>May 2026</span>
        <span>June 2026</span>
        <span>July 2026</span>
      </div>
    </div>
  );
};
