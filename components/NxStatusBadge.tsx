import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        danger: "bg-error/10 text-error border border-error/20",
        info: "bg-nexus-blue/10 text-nexus-blue border border-nexus-blue/20",
        neutral: "bg-white/10 text-gray-300 border border-white/10",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

export interface NxStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
  label: string;
  dot?: boolean;
}

export const NxStatusBadge = ({ className, status, label, dot = false, ...props }: NxStatusBadgeProps) => {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === 'success' ? "bg-success" :
          status === 'warning' ? "bg-warning" :
          status === 'danger' ? "bg-error" :
          status === 'info' ? "bg-nexus-blue" : "bg-gray-400"
        )} />
      )}
      {label}
    </span>
  );
};
