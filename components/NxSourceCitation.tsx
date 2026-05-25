import React from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, ExternalLink } from 'lucide-react';

export interface NxSourceCitationProps {
  title: string;
  url?: string;
  snippet?: string;
  relevanceScore?: number;
  className?: string;
}

export const NxSourceCitation = ({ title, url, snippet, relevanceScore, className }: NxSourceCitationProps) => {
  return (
    <div className={cn("flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-lg text-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-200 font-medium">
          <BookOpen className="w-4 h-4 text-nexus-blue" />
          <span className="line-clamp-1">{title}</span>
        </div>
        {relevanceScore !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-gray-400 shrink-0 font-mono">
            {Math.round(relevanceScore * 100)}% Match
          </span>
        )}
      </div>
      
      {snippet && (
        <p className="text-xs text-gray-400 line-clamp-2 border-l-2 border-white/10 pl-2 ml-1">
          &quot;{snippet}&quot;
        </p>
      )}
      
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-nexus-blue hover:underline mt-1 w-fit"
        >
          <span>View Source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};
