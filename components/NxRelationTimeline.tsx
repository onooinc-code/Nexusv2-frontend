"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Mail, Phone, Calendar, CheckCircle, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'task';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

interface NxRelationTimelineProps {
  events: readonly TimelineEvent[];
  className?: string;
}

export const NxRelationTimeline = ({ events, className }: NxRelationTimelineProps) => {
  return (
    <div className={cn("relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:w-0.5 before:bg-white/10 before:bottom-0", className)}>
      {events.map((event) => {
        const Icon = event.type === 'email' ? Mail : event.type === 'call' ? Phone : event.type === 'meeting' ? Calendar : CheckCircle;
        
        return (
          <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-dark shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow",
              event.status === 'completed' ? "bg-nexus-blue/20 text-nexus-blue" : "bg-warning/20 text-warning"
            )}>
              {event.status === 'pending' ? <Clock className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            
            {/* Content box */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-lg bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "font-semibold text-sm",
                  event.status === 'completed' ? "text-gray-100" : "text-warning"
                )}>
                  {event.title}
                </span>
                <span className="text-xs text-gray-400 font-mono">{event.date}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{event.description}</p>
              {/* Event Type Badge */}
              <div className="flex mt-3">
                <span className="px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-xs text-gray-500 capitalize flex items-center gap-1.5">
                   <Icon className="w-3 h-3" />
                   {event.type}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
