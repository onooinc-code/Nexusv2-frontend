/**
 * Skeleton loader component for smooth UI transitions
 * Shows loading placeholders while data is being fetched
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton = ({ className = '', count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-slate-800/50 rounded-md ${className}`} />
      ))}
    </>
  );
};

export const ContactCardSkeleton = () => (
  <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

export const GridCardSkeleton = () => (
  <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
    <div className="space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-2 flex-1 rounded" />
        <Skeleton className="h-2 w-1/4 rounded" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-slate-700 hover:bg-slate-900/50">
    <td className="px-6 py-3">
      <Skeleton className="h-4 w-1/3" />
    </td>
    <td className="px-6 py-3">
      <Skeleton className="h-4 w-1/4" />
    </td>
    <td className="px-6 py-3">
      <Skeleton className="h-4 w-1/4" />
    </td>
    <td className="px-6 py-3">
      <Skeleton className="h-3 w-12" />
    </td>
  </tr>
);

export const PageHeaderSkeleton = () => (
  <div className="mb-6 space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
