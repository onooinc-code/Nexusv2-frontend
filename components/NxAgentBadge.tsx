import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Bot } from 'lucide-react';

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-white/10 text-gray-100",
        active: "border-transparent bg-success/20 text-success",
        busy: "border-transparent bg-warning/20 text-warning",
        inactive: "border-transparent bg-gray-500/20 text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface NxAgentBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  name: string;
  showIcon?: boolean;
}

export const NxAgentBadge = ({ className, variant, name, showIcon = true, ...props }: NxAgentBadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showIcon && <Bot className="w-3.5 h-3.5 mr-1" />}
      {name}
    </div>
  );
};
