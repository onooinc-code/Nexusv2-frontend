import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const confidenceVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      level: {
        high: "border-success/30 bg-success/10 text-success",
        medium: "border-warning/30 bg-warning/10 text-warning",
        low: "border-error/30 bg-error/10 text-error",
      },
    },
    defaultVariants: {
      level: "medium",
    },
  }
);

export interface NxConfidenceBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof confidenceVariants> {
  score: number; // 0 to 1 (or 0 to 100)
}

export const NxConfidenceBadge = ({ className, score, ...props }: NxConfidenceBadgeProps) => {
  // Normalize score to 0-1 range if it's > 1
  const normalizedScore = score > 1 ? score / 100 : score;
  
  let level: "high" | "medium" | "low" = "medium";
  if (normalizedScore >= 0.8) level = "high";
  else if (normalizedScore <= 0.4) level = "low";

  return (
    <div className={cn(confidenceVariants({ level }), className)} {...props}>
      {Math.round(normalizedScore * 100)}% Conf
    </div>
  );
};
