"use client";

import React, { useRef, useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Mic } from 'lucide-react';

export interface NxChatInputProps {
  onSend: (message: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
  className?: string;
}

export const NxChatInput = ({ onSend, isProcessing, placeholder = "Type a message...", className }: NxChatInputProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'min-content';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const handleSend = () => {
    if (value.trim() && !isProcessing) {
      onSend(value.trim());
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'min-content';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("relative flex items-end gap-2 bg-surface-dark border border-white/10 rounded-2xl p-2 shadow-sm focus-within:border-nexus-blue/50 focus-within:ring-1 focus-within:ring-nexus-blue/50 transition-all", className)}>
      <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors shrink-0">
        <Paperclip className="w-5 h-5" />
      </button>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 max-h-[200px] bg-transparent border-none outline-none resize-none text-sm text-gray-200 placeholder:text-gray-500 py-2.5 overflow-y-auto min-h-[40px]"
        rows={1}
      />
      
      {value ? (
        <button 
          onClick={handleSend}
          disabled={isProcessing}
          className="p-2 bg-nexus-blue text-white rounded-full hover:bg-nexus-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      ) : (
        <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors shrink-0">
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
