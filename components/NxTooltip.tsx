"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface NxTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export const NxTooltip = ({ content, children, position = 'top', className, delay = 300 }: NxTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative flex items-center justify-center w-fit h-fit"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none border border-white/10",
          position === 'top' && "bottom-full mb-2",
          position === 'bottom' && "top-full mt-2",
          position === 'left' && "right-full mr-2",
          position === 'right' && "left-full ml-2",
          className
        )}>
          {content}
          
          {/* Arrow */}
          <div className={cn(
            "absolute w-2 h-2 bg-gray-800 transform rotate-45",
            position === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r border-white/10",
            position === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2 border-t border-l border-white/10",
            position === 'left' && "right-[-4px] top-1/2 -translate-y-1/2 border-t border-r border-white/10",
            position === 'right' && "left-[-4px] top-1/2 -translate-y-1/2 border-b border-l border-white/10",
          )} />
        </div>
      )}
    </div>
  );
};
