"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface NxConnectionDotProps {
  status?: 'online' | 'connecting' | 'offline' | 'error' | 'unknown';
  className?: string;
}

export const NxConnectionDot = ({ status = 'online', className }: NxConnectionDotProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a generic/neutral dot for SSR to avoid hydration mismatch
    return (
      <div className={cn("relative flex h-3 w-3", className)}>
        <span className="relative inline-flex rounded-full h-3 w-3 border border-deep-space/50 bg-gray-500/50" />
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-3 w-3", className)}>
      {status === 'online' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full h-3 w-3 border border-deep-space/50 transition-transform duration-200",
          status === 'online'
            ? "bg-success"
            : status === 'connecting'
            ? "bg-warning"
            : status === 'error'
            ? "bg-error animate-pulse"
            : "bg-error"
        )}
      />
    </div>
  );
};
