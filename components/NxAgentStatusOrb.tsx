import React from 'react';
import { cn } from '@/lib/utils';

export interface NxAgentStatusOrbProps {
  status: 'idle' | 'processing' | 'error' | 'offline';
  size?: number;
  className?: string;
}

export const NxAgentStatusOrb = ({ status, size = 16, className }: NxAgentStatusOrbProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Outer Glow for Processing/Error */}
      {(status === 'processing' || status === 'error') && (
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-md opacity-60 animate-pulse",
            status === 'processing' ? 'bg-nexus-blue' : 'bg-error'
          )} 
        />
      )}
      
      {/* Pinging outline for processing */}
      {status === 'processing' && (
        <div className="absolute inset-0 rounded-full border border-nexus-blue animate-ping opacity-75" />
      )}
      
      {/* Core Orb */}
      <div 
        className={cn(
          "relative rounded-full shadow-inner transition-colors duration-300 w-full h-full",
          status === 'idle' ? 'bg-success border border-success/50' :
          status === 'processing' ? 'bg-nexus-blue border border-nexus-blue/50' :
          status === 'error' ? 'bg-error border border-error/50' :
          'bg-gray-600 border border-gray-500/50'
        )}
      >
        {/* Specular Highlight (3D effect) */}
        <div className="absolute top-[15%] left-[20%] w-[30%] h-[30%] bg-white/60 rounded-full blur-[1px]" />
      </div>
    </div>
  );
};
