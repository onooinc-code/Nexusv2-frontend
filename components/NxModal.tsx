"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { NxGlassCard } from './NxGlassCard';

export interface NxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] h-[95vh]',
};

export const NxModal = ({ isOpen, onClose, title, children, className, size = 'md' }: NxModalProps) => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className={cn(
        "relative w-full z-50 animate-in fade-in zoom-in-95 duration-200", 
        sizeClasses[size], 
        size === 'full' && "flex flex-col",
        className
      )}>
        <NxGlassCard className={cn(
          "w-full flex shadow-2xl flex-col border border-white/10",
          size === 'full' ? "h-full" : "max-h-[85vh]"
        )} padding="none">
          
          {(title || true) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/5">
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
          
          <div className={cn(
            "p-6 overflow-y-auto",
            size === 'full' ? "flex-1" : ""
          )}>
            {children}
          </div>
        </NxGlassCard>
      </div>
    </div>
  );
};
