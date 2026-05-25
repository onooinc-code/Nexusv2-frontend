"use client";

import React, { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NxCommandBar = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center w-full max-w-sm bg-black/20 hover:bg-black/40 border border-white/10 hover:border-white/20 rounded-full px-3 py-1.5 transition-colors text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-nexus-blue"
      >
        <Search className="w-4 h-4 mr-2 text-gray-500" />
        <span className="flex-1 text-left hidden sm:inline-block">Search or command...</span>
        <span className="flex-1 text-left sm:hidden">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono font-medium text-gray-400">
          <Command className="w-3 h-3" /> K
        </kbd>
      </button>

      {/* Simplified Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-xl mx-4 bg-surface-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden glass animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Type a command or search..." 
                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder:text-gray-500 text-base"
              />
              <button onClick={() => setIsOpen(false)} className="text-xs px-2 py-1 bg-white/10 rounded text-gray-400 hover:text-white transition-colors">Esc</button>
            </div>
            <div className="p-4 text-center text-sm text-gray-500">
              Start typing to search workflows, agents, or contacts...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
