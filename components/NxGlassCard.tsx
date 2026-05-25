import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  "glass rounded-xl overflow-hidden text-gray-100 transition-all duration-200",
  {
    variants: {
      elevation: {
        none: "shadow-none",
        low: "shadow-1 hover:shadow-2",
        medium: "shadow-2 hover:shadow-3 hover:-translate-y-0.5",
        high: "shadow-3 hover:-translate-y-1",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      elevation: "low",
      padding: "md",
    }
  }
);

export interface NxGlassCardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof glassCardVariants> {
  as?: React.ElementType;
}

export const NxGlassCard = React.forwardRef<HTMLDivElement, NxGlassCardProps>(
  ({ className, elevation, padding, as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(glassCardVariants({ elevation, padding, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
NxGlassCard.displayName = "NxGlassCard";
