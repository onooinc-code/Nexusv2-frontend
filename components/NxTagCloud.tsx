"use client";

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

export interface NxTagCloudProps {
  tags: { text: string; count: number }[];
  onTagClick?: (tag: string) => void;
  selectedTag?: string;
  className?: string;
}

export const NxTagCloud = ({ tags, onTagClick, selectedTag, className }: NxTagCloudProps) => {
  if (!tags || tags.length === 0) {
    return (
      <div className="text-gray-500 text-xs font-mono p-4 text-center">
        No tags indexed.
      </div>
    );
  }

  // Get min/max counts to map font sizes or opacity
  const counts = tags.map(t => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const countRange = maxCount - minCount || 1;

  return (
    <div className={cn("flex flex-wrap gap-2 p-4 bg-black/10 rounded-xl border border-white/5", className)}>
      <div className="w-full flex items-center gap-1.5 text-xs font-mono text-gray-400 mb-2 border-b border-white/5 pb-1.5">
        <Tag className="w-3.5 h-3.5 text-nexus-blue animate-pulse" />
        <span>MEMORIES TAG CLOUD</span>
      </div>
      
      <div className="flex flex-wrap gap-2.5 justify-center items-center py-2">
        {tags.map((tag) => {
          // Normalize scale: font-size between 11px and 18px
          const scaleOffset = (tag.count - minCount) / countRange;
          const fontSize = 11 + scaleOffset * 7;
          const isSelected = selectedTag?.toLowerCase() === tag.text.toLowerCase();

          return (
            <motion.button
              key={tag.text}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTagClick?.(tag.text)}
              className={cn(
                "px-2.5 py-1 rounded-lg border font-mono tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                isSelected
                  ? "bg-nexus-blue text-white border-nexus-blue shadow-lg shadow-nexus-blue/20"
                  : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-nexus-blue/40 hover:bg-white/10"
              )}
              style={{ fontSize: `${fontSize}px` }}
            >
              <span>#{tag.text}</span>
              <span className={cn(
                "text-[9px] px-1 rounded-full font-bold",
                isSelected ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"
              )}>
                {tag.count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
