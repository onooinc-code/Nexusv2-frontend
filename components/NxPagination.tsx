import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NxPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const NxPagination = ({ currentPage, totalPages, onPageChange, className }: NxPaginationProps) => {
  return (
    <nav className={cn("flex items-center space-x-2", className)} aria-label="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-1.5 border border-white/10 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="text-sm text-gray-300 font-medium px-2">
        Page {currentPage} of {totalPages}
      </div>

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-1.5 border border-white/10 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
