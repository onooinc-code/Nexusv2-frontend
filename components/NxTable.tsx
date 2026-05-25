import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface NxTableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const NxTable = forwardRef<HTMLTableElement, NxTableProps>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto border border-white/10 rounded-lg bg-surface-dark/30">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
NxTable.displayName = "NxTable";

export const NxTableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b border-white/10 bg-surface-dark/70", className)} {...props} />
));
NxTableHeader.displayName = "NxTableHeader";

export const NxTableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0 bg-transparent", className)} {...props} />
));
NxTableBody.displayName = "NxTableBody";
