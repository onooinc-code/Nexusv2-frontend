import React from 'react';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface NxMetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const NxMetricCard = ({ title, value, trend, trendValue, icon, className }: NxMetricCardProps) => {
  return (
    <NxGlassCard className={cn("p-5 flex justify-between items-start gap-4", className)}>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        
        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-2 font-medium",
            trend === 'up' ? "text-success" : trend === 'down' ? "text-error" : "text-gray-400"
          )}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : 
             trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : 
             <Minus className="w-3.5 h-3.5" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      {icon && (
        <div className="p-3 bg-surface-dark border border-white/5 rounded-xl shrink-0 opacity-80">
          {icon}
        </div>
      )}
    </NxGlassCard>
  );
};
