"use client";

import React from 'react';
import { NxGlassCard } from './NxGlassCard';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';

interface NxMessageBubbleProps {
  message: {
    id: number;
    body: string;
    direction: 'inbound' | 'outbound';
    source_timestamp: string;
    channel: string;
    sender_name?: string;
  };
  contactName: string;
  contactAvatar?: string;
}

export const NxMessageBubble: React.FC<NxMessageBubbleProps> = ({ message, contactName, contactAvatar }) => {
  const isInbound = message.direction === 'inbound';
  
  return (
    <div className={`flex w-full ${isInbound ? 'justify-start' : 'justify-end'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isInbound ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/5 shadow-lg">
            {isInbound ? (
              contactAvatar ? (
                <Image src={contactAvatar} alt={contactName} width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )
            ) : (
              <span className="text-xs font-bold text-nexus-blue">NX</span>
            )}
          </div>
        </div>

        {/* Bubble */}
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-2 text-xs ${isInbound ? 'justify-start' : 'justify-end'}`}>
            <span className="font-semibold text-gray-300">
              {isInbound ? (message.sender_name || contactName) : 'Nexus Agent'}
            </span>
            <span className="text-gray-500 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(message.source_timestamp).toLocaleString(undefined, { 
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className={`px-4 py-3 rounded-2xl shadow-md ${
            isInbound 
              ? 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5 backdrop-blur-sm' 
              : 'bg-nexus-blue/90 text-white rounded-tr-sm border border-nexus-blue shadow-[0_0_15px_rgba(45,212,191,0.2)]'
          }`}>
            <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {message.body || <em className="text-white/50">Media message omitted</em>}
            </p>
          </div>
          
          {/* Channel Indicator */}
          <div className={`flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wider ${isInbound ? 'justify-start' : 'justify-end'}`}>
            {message.channel === 'whatsapp' ? 'WhatsApp' : message.channel === 'facebook_messenger' ? 'Messenger' : message.channel}
          </div>
        </div>
      </div>
    </div>
  );
};
