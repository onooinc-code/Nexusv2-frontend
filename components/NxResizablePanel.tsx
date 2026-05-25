"use client";

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, GripHorizontal } from 'lucide-react';

export interface NxResizablePanelProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export const NxResizablePanel = ({
  children,
  direction = 'horizontal',
  initialSize = 250,
  minSize = 100,
  maxSize = 800,
  className,
  side = 'left'
}: NxResizablePanelProps) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newSize = size;

      if (direction === 'horizontal') {
        if (side === 'left') {
          newSize = e.clientX;
        } else {
          newSize = window.innerWidth - e.clientX;
        }
      } else {
        if (side === 'top') {
          newSize = e.clientY;
        } else {
          newSize = window.innerHeight - e.clientY;
        }
      }

      if (newSize >= minSize && newSize <= maxSize) {
        setSize(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, size, minSize, maxSize, direction, side]);

  return (
    <div
      className={cn("relative flex bg-surface-dark border-white/10 shrink-0", className)}
      style={{
        [direction === 'horizontal' ? 'width' : 'height']: size,
        [side === 'left' ? 'borderRightWidth' : side === 'right' ? 'borderLeftWidth' : side === 'top' ? 'borderBottomWidth' : 'borderTopWidth']: 1
      }}
    >
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
      
      <div
        ref={resizeRef}
        className={cn(
          "absolute flex items-center justify-center transition-colors hover:bg-nexus-blue/50 z-10",
          direction === 'horizontal' ? "w-1 cursor-col-resize h-full top-0" : "h-1 cursor-row-resize w-full left-0",
          side === 'left' ? "-right-[2.5px]" : side === 'right' ? "-left-[2.5px]" : side === 'top' ? "-bottom-[2.5px]" : "-top-[2.5px]",
          isResizing && "bg-nexus-blue"
        )}
        onMouseDown={() => setIsResizing(true)}
      >
        <div className={cn(
          "bg-white/10 rounded flex items-center justify-center pointer-events-none",
          direction === 'horizontal' ? "h-8 w-4" : "w-8 h-4"
        )}>
           {direction === 'horizontal' ? <GripVertical className="w-3 h-3 text-gray-500" /> : <GripHorizontal className="w-3 h-3 text-gray-500" />}
        </div>
      </div>
    </div>
  );
};
