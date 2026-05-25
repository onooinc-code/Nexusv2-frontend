import React from 'react';
import { cn } from '@/lib/utils';

export interface NxFlowLinesProps {
  active?: boolean;
  direction?: 'horizontal' | 'vertical';
  length?: number | string;
  className?: string;
}

export const NxFlowLines = ({ 
  active = false, 
  direction = 'horizontal', 
  length = '100%',
  className 
}: NxFlowLinesProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        direction === 'horizontal' ? "h-[2px]" : "w-[2px]",
        className
      )}
      style={{
        [direction === 'horizontal' ? 'width' : 'height']: length
      }}
    >
      <div className={cn(
        "absolute inset-0 bg-white/10",
      )} />
      
      {active && (
        <div 
          className={cn(
            "absolute bg-gradient-to-r from-transparent via-nexus-blue to-transparent",
            direction === 'horizontal' ? "h-full w-1/3 animate-flow-horizontal" : "w-full h-1/3 animate-flow-vertical"
          )} 
        />
      )}
    </div>
  );
};
