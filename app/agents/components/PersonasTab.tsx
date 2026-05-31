"use client";

import React, { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store';
import { Plus, Trash2, Edit2, Bot, Sparkles, Loader2 } from 'lucide-react';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';

export function PersonasTab() {
  const { personas, hydratePersonas, createPersona, deletePersona, loading } = useGlobalStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
  });

  const isLoading = loading['personas'] || false;

  useEffect(() => {
    hydratePersonas();
  }, [hydratePersonas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.system_prompt) return;
    
    await createPersona({
      name: formData.name,
      description: formData.description,
      system_prompt: formData.system_prompt,
    });
    
    setFormData({ name: '', description: '', system_prompt: '' });
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            Agent Personas
          </h2>
          <p className="text-sm text-gray-400">
            Define system prompts and core behavioral traits.
          </p>
        </div>
        <NxActionButton 
          variant="primary" 
          onClick={() => setIsCreating(!isCreating)}
          leftIcon={isCreating ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {isCreating ? 'Cancel' : 'New Persona'}
        </NxActionButton>
      </div>

      {isCreating && (
        <NxGlassCard className="border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <h3 className="text-sm font-medium text-gray-200 border-b border-white/5 pb-2">
              Create New Persona
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-medium">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-nexus-blue focus:outline-none transition-colors"
                  placeholder="e.g. Code Reviewer"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-medium">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-nexus-blue focus:outline-none transition-colors"
                  placeholder="e.g. Expert in Python architecture"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">System Prompt</label>
              <textarea 
                value={formData.system_prompt}
                onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-nexus-blue focus:outline-none transition-colors min-h-[100px] resize-y"
                placeholder="You are an expert developer..."
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <NxActionButton type="submit" variant="primary" size="sm">
                Save Persona
              </NxActionButton>
            </div>
          </form>
        </NxGlassCard>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 text-nexus-blue animate-spin" />
        </div>
      ) : personas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
          <Sparkles className="w-8 h-8 mb-3 opacity-50" />
          <p>No personas found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <NxGlassCard key={persona.id} className="hover:border-white/20 transition-all duration-300 group">
              <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-100">{persona.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{persona.description || 'No description'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-900/50 rounded-lg p-3 text-xs text-gray-400 font-mono overflow-hidden mb-4 border border-white/5 line-clamp-4">
                  {persona.system_prompt}
                </div>
                
                <div className="flex justify-end mt-auto pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deletePersona(persona.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete Persona"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </NxGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
