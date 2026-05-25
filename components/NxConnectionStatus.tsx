import React from 'react';
import { cn } from '@/lib/utils';
import { NxConnectionDot } from './NxConnectionDot';

export interface NxConnectionStatusProps {
  status: 'online' | 'connecting' | 'offline';
  label?: string;
  className?: string;
}

export const NxConnectionStatus = ({ status, label, className }: NxConnectionStatusProps) => {
  const defaultLabel = status === 'online' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected';
  
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <NxConnectionDot status={status} />
      <span className={cn(
        status === 'online' ? "text-success" : 
        status === 'connecting' ? "text-warning" : "text-error"
      )}>
        {label || defaultLabel}
      </span>
    </div>
  );
};
