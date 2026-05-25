"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { NxTable, NxTableHeader, NxTableBody } from './NxTable';
import { NxTableHead, NxTableCell } from './NxTableCell';
import { NxTableRow } from './NxTableRow';
import { NxPagination } from './NxPagination';
import { NxGlassCard } from './NxGlassCard';

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
}

export interface NxDataGridProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
}

export const NxDataGrid = <T extends Record<string, any>>({ 
  data, 
  columns, 
  pageSize = 10,
  className,
  emptyMessage = "No results found."
}: NxDataGridProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const currentData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <NxGlassCard className={cn("flex flex-col gap-0 w-full overflow-hidden border border-white/10 shadow-lg", className)} padding="none">
      <div className="w-full overflow-x-auto">
        <NxTable className="border-0 rounded-none bg-transparent">
          <NxTableHeader>
            <NxTableRow className="border-b border-white/10 bg-black/20 hover:bg-black/20">
              {columns.map(col => (
                <NxTableHead key={col.key} className="border-0 whitespace-nowrap">{col.header}</NxTableHead>
              ))}
            </NxTableRow>
          </NxTableHeader>
          <NxTableBody>
            {currentData.length > 0 ? (
              currentData.map((item, idx) => (
                <NxTableRow key={idx}>
                  {columns.map(col => (
                    <NxTableCell key={col.key}>
                      {col.cell ? col.cell(item) : item[col.key]}
                    </NxTableCell>
                  ))}
                </NxTableRow>
              ))
            ) : (
               <NxTableRow>
                 <NxTableCell colSpan={columns.length} className="text-center text-gray-400 py-12">
                   {emptyMessage}
                 </NxTableCell>
               </NxTableRow>
            )}
          </NxTableBody>
        </NxTable>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-3 border-t border-white/10 shrink-0 bg-surface-dark/50">
          <div className="text-xs text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
          </div>
          <NxPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </NxGlassCard>
  );
};
