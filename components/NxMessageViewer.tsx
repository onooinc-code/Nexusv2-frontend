"use client";

import React, { useState, useEffect } from 'react';
import { NxGlassCard } from './NxGlassCard';
import { NxActionButton } from './NxActionButton';
import { Search, Filter, Loader2, MessageSquare } from 'lucide-react';
import { NxMessageBubble } from './NxMessageBubble';

interface NxMessageViewerProps {
  contactId: number;
  contactName: string;
  contactAvatar?: string;
}

export const NxMessageViewer: React.FC<NxMessageViewerProps> = ({ contactId, contactName, contactAvatar }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'facebook'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (channelFilter !== 'all') {
         queryParams.append('channel', channelFilter === 'facebook' ? 'facebook_messenger' : channelFilter);
      }
      if (searchQuery) {
         queryParams.append('search', searchQuery);
      }
      
      const response = await fetch(`http://localhost:8000/api/v1/contacts/${contactId}/messages?${queryParams.toString()}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      const json = await response.json();
      setMessages(json.data.data || []); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages();
    }, 300);
    return () => clearTimeout(timer);
  }, [contactId, channelFilter, searchQuery]);

  return (
    <NxGlassCard className="flex flex-col h-[600px] p-0 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
        <div className="flex bg-white/5 rounded-lg p-1">
          <button 
            onClick={() => setChannelFilter('all')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${channelFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            All Messages
          </button>
          <button 
            onClick={() => setChannelFilter('whatsapp')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${channelFilter === 'whatsapp' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button 
            onClick={() => setChannelFilter('facebook')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${channelFilter === 'facebook' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Messenger
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-nexus-blue/50 transition-colors"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-transparent to-black/20">
        {isLoading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-nexus-blue" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-600" />
            <p>No messages found in this conversation.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <NxMessageBubble 
              key={msg.id} 
              message={msg} 
              contactName={contactName} 
              contactAvatar={contactAvatar} 
            />
          ))
        )}
      </div>
    </NxGlassCard>
  );
};
