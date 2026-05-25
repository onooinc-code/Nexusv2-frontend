import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const NxTableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-3 align-middle text-gray-300 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
NxTableCell.displayName = "NxTableCell";

export const NxTableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-3 text-left align-middle font-semibold text-gray-200 [&:has([role=checkbox])]:pr-0 border-b border-white/10",
      className
    )}
    {...props}
  />
));
NxTableHead.displayName = "NxTableHead";
