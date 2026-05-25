"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { NxGlassCard } from './NxGlassCard';
import { NxLiveRegion } from './NxLiveRegion';

export interface NxToastProps {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
  duration?: number;
  className?: string;
}

export const NxToast = ({ 
  id, 
  title, 
  description, 
  type = 'info', 
  onClose, 
  duration = 5000,
  className 
}: NxToastProps) => {
  const message = `${title}${description ? ': ' + description : ''}`;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-nexus-blue" />,
  };

  const borders = {
    success: 'border-l-success',
    error: 'border-l-error',
    warning: 'border-l-warning',
    info: 'border-l-nexus-blue',
  };

  return (
    <>
      <NxGlassCard 
        className={cn(
          "pointer-events-auto flex items-start gap-4 p-4 w-full max-w-sm shadow-xl border-l-[3px] border-r-white/10 border-y-white/10 animate-in slide-in-from-top-4 fade-in duration-300", 
          borders[type],
          className
        )}
        padding="none"
      >
        <div className="shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 w-0">
          <p className="text-sm font-medium text-gray-100">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
        <div className="shrink-0 flex ml-4">
          <button
            onClick={() => onClose(id)}
            className="inline-flex text-gray-400 hover:text-white hover:bg-white/10 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-blue"
          >
            <span className="sr-only">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </NxGlassCard>
      
      {/* ARIA Live Region for screen readers */}
      <NxLiveRegion message={message} politeness="assertive" />
    </>
  );
};
