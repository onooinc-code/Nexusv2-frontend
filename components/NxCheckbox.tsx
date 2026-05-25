import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface NxCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const NxCheckbox = forwardRef<HTMLInputElement, NxCheckboxProps>(
  ({ className, label, description, disabled, id, ...props }, ref) => {
    // Generate a secure ID if none is provided but a label exists
    const checkboxId = id || (label ? `nx-checkbox-${label.replace(/\\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 5)}` : undefined);
    
    return (
      <div className={cn("flex flex-row items-start space-x-3", className)}>
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            disabled={disabled}
            className="peer h-5 w-5 shrink-0 appearance-none rounded border border-white/20 bg-white/5 transition-colors checked:border-nexus-blue checked:bg-nexus-blue hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
        </div>
        
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium leading-tight text-gray-200",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn("text-xs text-gray-400 mt-1", disabled && "opacity-50")}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

NxCheckbox.displayName = "NxCheckbox";
