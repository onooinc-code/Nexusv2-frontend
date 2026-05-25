"use client";

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';

export interface NxContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  dangerous?: boolean;
  disabled?: boolean;
}

export interface NxContextMenuProps {
  children: ReactNode;
  items: NxContextMenuItem[];
  className?: string;
}

export const NxContextMenu = ({ children, items, className }: NxContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div onContextMenu={handleContextMenu} className={cn("w-fit h-fit", className)}>
      {children}
      
      {isOpen && (
        <div 
          className="fixed z-[100] min-w-[200px]"
          style={{ top: position.y, left: position.x }}
        >
          <NxGlassCard padding="none" className="py-1 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-100">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                  item.disabled ? "opacity-50 cursor-not-allowed text-gray-500" : 
                  item.dangerous ? "text-error hover:bg-error/10" : "text-gray-200 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </NxGlassCard>
        </div>
      )}
    </div>
  );
};
