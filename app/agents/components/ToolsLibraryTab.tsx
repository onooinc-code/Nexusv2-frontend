"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Wrench, Loader2, Sparkles } from 'lucide-react';
import { NxGlassCard } from '@/components/NxGlassCard';

export function ToolsLibraryTab() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/agent-tools');
      if (res.data?.success) {
        setTools(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tools', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-nexus-blue" />
            Tools Library
          </h2>
          <p className="text-sm text-gray-400">
            Browse built-in tools and capabilities available to agents.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 text-nexus-blue animate-spin" />
        </div>
      ) : tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
          <Sparkles className="w-8 h-8 mb-3 opacity-50" />
          <p>No tools found in the library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <NxGlassCard key={tool.id} className="hover:border-white/20 transition-all duration-300">
              <div className="p-5 flex flex-col h-full gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-100">{tool.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-nexus-blue bg-nexus-blue/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {tool.category || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 line-clamp-3 flex-1 mt-2">
                  {tool.description || 'No description available.'}
                </p>
                
                {tool.config && Object.keys(tool.config).length > 0 && (
                  <div className="mt-2 bg-gray-900/50 p-3 rounded-md border border-white/5 overflow-hidden">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Configuration Schema</p>
                    <pre className="text-xs text-gray-300 font-mono">
                      {JSON.stringify(tool.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </NxGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
