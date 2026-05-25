import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const NxTableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-white/10 transition-colors hover:bg-white/[0.08] data-[state=selected]:bg-white/10 group cursor-default",
      className
    )}
    {...props}
  />
));
NxTableRow.displayName = "NxTableRow";
