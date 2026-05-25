"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxChatBubble } from '@/components/NxChatBubble';
import { NxChatInput } from '@/components/NxChatInput';
import { NxMessageActions } from '@/components/NxMessageActions';
import { MessageSquare, Users, History, Hash } from 'lucide-react';
import { useAppStore } from '@/store/store-provider';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "Project Alpha Sync", lastMessage: "Let's review the final scope.", timestamp: "10:30 AM", unread: 2 },
  { id: "2", title: "Dr. Evelyn Wright", lastMessage: "The architecture looks good, I've appended the changes.", timestamp: "Yesterday", unread: 0 },
  { id: "3", title: "Ops Alert Channel", lastMessage: "Pipeline deployment successful in eu-west.", timestamp: "Yesterday", unread: 5 },
  { id: "4", title: "AI Model Tuning", lastMessage: "Decreasing temperature improved factual responses.", timestamp: "May 20", unread: 0 },
];

export default function ConversationsPage() {
  const [activeConv, setActiveConv] = useState<string>("1");
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'user', content: 'What is the current status of the project Alpha?' },
    { role: 'assistant', content: 'Project Alpha is currently in Phase 3. The foundational components are deployed, and we are working on the secondary hubs.' },
    { role: 'user', content: 'Let\'s review the final scope.' }
  ]);
  
  const handleSendMessage = (text: string) => {
    setMessages([...messages, { role: 'user', content: text }]);
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I have logged your request. Our automated systems will track this.' }]);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="flex h-full w-full max-w-7xl mx-auto overflow-hidden bg-black/20 border-x border-white/5">
        {/* Left Sidebar (Conversations List) */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-surface-dark/30">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-nexus-blue" />
              Conversations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {DEFAULT_CONVERSATIONS.map(conv => (
              <button 
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1 ${
                  activeConv === conv.id 
                    ? 'bg-nexus-blue/10 border border-nexus-blue/20' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`font-medium truncate ${activeConv === conv.id ? 'text-nexus-blue' : 'text-gray-200'}`}>
                    {conv.title}
                  </span>
                  <span className="text-[10px] text-gray-500 shrink-0">{conv.timestamp}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <p className="text-xs text-gray-400 truncate pr-4">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="shrink-0 bg-nexus-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative h-full">
          {/* Main header */}
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-surface-dark/50 shrink-0">
             <div className="flex items-center gap-3">
               <Hash className="w-4 h-4 text-gray-500" />
               <span className="font-semibold text-gray-200">
                 {DEFAULT_CONVERSATIONS.find(c => c.id === activeConv)?.title}
               </span>
             </div>
             <div className="flex items-center gap-3">
               <button className="text-gray-400 hover:text-white transition-colors p-2">
                 <Users className="w-4 h-4" />
               </button>
               <button className="text-gray-400 hover:text-white transition-colors p-2">
                 <History className="w-4 h-4" />
               </button>
             </div>
          </div>
          
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <NxChatBubble 
                    id={`msg-${i}`}
                    content={m.content} 
                    role={m.role} 
                    timestamp={new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-surface-dark/30 shrink-0">
            <NxChatInput 
              onSend={handleSendMessage} 
              isProcessing={false} 
              placeholder="Type your message..."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
