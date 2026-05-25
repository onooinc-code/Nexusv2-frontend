import React from 'react';
import { cn } from '@/lib/utils';

export interface NxProviderDotsProps {
  providers: ('openai' | 'anthropic' | 'gemini' | 'local')[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const providerColors = {
  openai: 'bg-green-500',
  anthropic: 'bg-amber-700',
  gemini: 'bg-blue-500',
  local: 'bg-gray-400',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
};

export const NxProviderDots = ({ providers, className, size = 'md' }: NxProviderDotsProps) => {
  // Deduplicate
  const uniqueProviders = Array.from(new Set(providers));
  
  return (
    <div className={cn("flex items-center -space-x-1", className)}>
      {uniqueProviders.map((provider, i) => (
        <div 
          key={provider} 
          className={cn(
            "rounded-full border border-surface-dark shadow-sm z-10",
            sizeClasses[size],
            providerColors[provider] || 'bg-white'
          )}
          style={{ zIndex: uniqueProviders.length - i }}
          title={provider}
        />
      ))}
    </div>
  );
};
