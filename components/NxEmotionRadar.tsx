"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { NxGlassCard } from './NxGlassCard';

export interface EmotionData {
  emotion: string;
  value: number; // 0-100
}

export interface NxEmotionRadarProps {
  data: EmotionData[];
  className?: string;
  title?: string;
}

export const NxEmotionRadar = ({ data, className, title = "Sentiment Analysis" }: NxEmotionRadarProps) => {
  return (
    <NxGlassCard className={cn("w-full h-full flex flex-col min-h-[250px]", className)} padding="sm">
      {title && <h3 className="text-gray-100 font-medium text-sm mb-2 px-2">{title}</h3>}
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="emotion" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickCount={4}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(22, 27, 34, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Radar
              name="Emotion"
              dataKey="value"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </NxGlassCard>
  );
};
