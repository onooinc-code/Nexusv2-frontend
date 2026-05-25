import React from 'react';
import { cn } from '@/lib/utils';

export interface NxSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const NxSkeleton = ({ className, variant = 'rectangular', ...props }: NxSkeletonProps) => {
  const baseClasses = "animate-pulse bg-white/10";
  
  if (variant === 'text') {
    return (
      <div 
        className={cn(baseClasses, "h-4 w-3/4 rounded-md", className)} 
        {...props} 
      />
    );
  }

  if (variant === 'circular') {
    return (
      <div 
        className={cn(baseClasses, "h-10 w-10 rounded-full", className)} 
        {...props} 
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("border border-white/10 bg-surface-dark rounded-xl p-4 flex flex-col gap-3 w-full", className)} {...props}>
        <div className="flex gap-4 items-center">
          <div className={cn(baseClasses, "w-10 h-10 rounded-full")} />
          <div className="flex flex-col gap-2 flex-1">
            <div className={cn(baseClasses, "h-4 w-1/3 rounded-md")} />
            <div className={cn(baseClasses, "h-3 w-1/4 rounded-md")} />
          </div>
        </div>
        <div className={cn(baseClasses, "h-4 w-full rounded-md mt-2")} />
        <div className={cn(baseClasses, "h-4 w-5/6 rounded-md")} />
      </div>
    );
  }

  return (
    <div 
      className={cn(baseClasses, "rounded-md", className)} 
      {...props} 
    />
  );
};
