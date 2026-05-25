"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface NxSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const NxSwitch = forwardRef<HTMLInputElement, NxSwitchProps>(({ className, label, checked, disabled, ...props }, ref) => {
  return (
    <label className={cn("inline-flex items-center gap-3", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <div className={cn(
          "h-6 w-11 rounded-full border border-transparent transition-colors",
          checked ? "bg-nexus-blue" : "bg-white/10 peer-hover:bg-white/20 peer-focus-visible:ring-2 peer-focus-visible:ring-nexus-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-dark"
        )} />
        <div className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )} />
      </div>
      {label && <span className="text-sm font-medium text-gray-200">{label}</span>}
    </label>
  );
});

NxSwitch.displayName = "NxSwitch";
