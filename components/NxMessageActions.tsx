"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, ThumbsUp, ThumbsDown, Check, RotateCcw } from 'lucide-react';

export interface NxMessageActionsProps {
  messageId: string;
  content: string;
  onRegenerate?: () => void;
  className?: string;
}

export const NxMessageActions = ({ messageId, content, onRegenerate, className }: NxMessageActionsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex items-center gap-1 bg-surface-dark border border-white/10 rounded-lg shadow-sm p-1", className)}>
      <button 
        onClick={handleCopy}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        title="Copy message"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      
      <div className="w-px h-4 bg-white/10 mx-1" />
      
      <button className="p-1.5 text-gray-400 hover:text-success hover:bg-success/10 rounded-md transition-colors">
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      
      <button className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-md transition-colors">
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      
      {onRegenerate && (
        <>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button 
            onClick={onRegenerate}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Regenerate response"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
