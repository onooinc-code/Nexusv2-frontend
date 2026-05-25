"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';

export interface NxPopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const NxPopover = ({ trigger, content, position = 'bottom', className }: NxPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-block"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div className={cn(
          "absolute z-[100] animate-in fade-in zoom-in-95 duration-100",
          position === 'bottom' && "top-full mt-2 left-1/2 -translate-x-1/2",
          position === 'top' && "bottom-full mb-2 left-1/2 -translate-x-1/2",
          position === 'left' && "right-full mr-2 top-1/2 -translate-y-1/2",
          position === 'right' && "left-full ml-2 top-1/2 -translate-y-1/2",
        )}>
          <NxGlassCard padding="sm" className={cn("min-w-[200px] border border-white/10 shadow-xl", className)}>
            {content}
          </NxGlassCard>
        </div>
      )}
    </div>
  );
};
