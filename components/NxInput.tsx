import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nexus-blue disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      hasError: {
        true: "border-error focus-visible:ring-error",
        false: "border-white/10 hover:border-white/20",
      },
      hasIcon: {
        true: "pl-10",
        false: "",
      }
    },
    defaultVariants: {
      hasError: false,
      hasIcon: false,
    },
  }
);

export interface NxInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const NxInput = forwardRef<HTMLInputElement, NxInputProps>(({ className, type = "text", icon, error, helperText, hasError, ...props }, ref) => {
  const isError = Boolean(error) || hasError;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(inputVariants({ hasError: isError, hasIcon: !!icon }), className)}
          ref={ref}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span className={cn("text-xs px-1", error ? "text-error" : "text-gray-400")}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

NxInput.displayName = "NxInput";
