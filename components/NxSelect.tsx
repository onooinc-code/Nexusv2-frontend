import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface NxSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helperText?: string;
}

export const NxSelect = forwardRef<HTMLSelectElement, NxSelectProps>(({ className, error, helperText, children, ...props }, ref) => {
  const isError = Boolean(error);
  
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border bg-white/5 px-3 py-2 pr-8 text-sm text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nexus-blue disabled:cursor-not-allowed disabled:opacity-50",
            isError ? "border-error focus-visible:ring-error" : "border-white/10 hover:border-white/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {(error || helperText) && (
        <span className={cn("text-xs px-1", error ? "text-error" : "text-gray-400")}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

NxSelect.displayName = "NxSelect";
