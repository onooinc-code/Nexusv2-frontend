import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { NxMessageActions } from './NxMessageActions';

export interface NxChatBubbleProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: React.ReactNode;
  timestamp?: string;
  agentName?: string;
  className?: string;
}

export const NxChatBubble = ({ id, role, content, timestamp, agentName, className }: NxChatBubbleProps) => {
  const isUser = role === 'user';
  
  return (
    <div className={cn("flex gap-4 w-full", isUser ? "flex-row-reverse" : "flex-row", className)}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
        isUser ? "bg-white/10" : "bg-nexus-blue/20 text-nexus-blue"
      )}>
        {isUser ? <User className="w-5 h-5 text-gray-300" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 px-1 text-xs text-gray-500">
          {!isUser && agentName && <span className="font-medium text-gray-300">{agentName}</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
        
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap relative group",
          isUser 
            ? "bg-nexus-blue text-white rounded-tr-sm" 
            : "bg-surface-dark border border-white/10 text-gray-200 rounded-tl-sm"
        )}>
          {content}
          
          {!isUser && (
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <NxMessageActions messageId={id} content={typeof content === 'string' ? content : ''} />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
