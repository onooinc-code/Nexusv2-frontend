import React from 'react';
import { cn } from '@/lib/utils';

export interface NxEngagementRingProps {
  percentage: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  label?: string;
}

export const NxEngagementRing = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  className,
  color = "text-nexus-blue",
  label
}: NxEngagementRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/10 fill-none"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-none transition-all duration-1000 ease-out", color)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-gray-100">{safePercentage}%</span>
        {label && <span className="text-[10px] text-gray-400 -mt-1">{label}</span>}
      </div>
    </div>
  );
};
