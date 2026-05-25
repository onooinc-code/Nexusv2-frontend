"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud } from 'lucide-react';

export interface NxDragDropZoneProps {
  onDrop: (files: File[]) => void;
  className?: string;
  accept?: string;
  maxFiles?: number;
}

export const NxDragDropZone = ({ onDrop, className, accept, maxFiles = 10 }: NxDragDropZoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      onDrop(files);
      e.dataTransfer.clearData();
    }
  }, [maxFiles, onDrop]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
        isDragActive ? "border-nexus-blue bg-nexus-blue/10" : "border-white/20 bg-surface-dark hover:bg-white/5",
        className
      )}
    >
      <div className={cn(
        "p-4 rounded-full mb-4",
        isDragActive ? "bg-nexus-blue/20 text-nexus-blue" : "bg-white/5 text-gray-400"
      )}>
        <UploadCloud className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-gray-200">
        {isDragActive ? "Drop files here" : "Drag & drop files here, or click to select"}
      </p>
      {accept && (
        <p className="text-xs text-gray-400 mt-2">
          Accepted types: {accept}
        </p>
      )}
    </div>
  );
};
