"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface NxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-md',
  xl: 'max-w-xl',
};

export const NxDrawer = ({ isOpen, onClose, title, children, side = 'right', className, size = 'md' }: NxDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className={cn(
        "relative w-[90vw] h-full z-50 flex flex-col glass rounded-none border-0 shadow-2xl transition-transform duration-300 ease-out", 
        side === 'right' ? "ml-auto border-l animate-in slide-in-from-right-full" : "mr-auto border-r animate-in slide-in-from-left-full",
        sizeClasses[size], 
        className
      )}>
        {(title || true) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-surface-dark/50">
            {title && (
              <div className="font-semibold text-lg text-gray-100">
                {title}
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-auto focus:outline-none focus:ring-2 focus:ring-nexus-blue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-6 bg-surface-dark/40">
          {children}
        </div>
      </div>
    </div>
  );
};
