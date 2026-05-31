"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxMemoryChip } from '@/components/NxMemoryChip';
import { NxModal } from '@/components/NxModal';
import { NxInput } from '@/components/NxInput';
import { NxSelect } from '@/components/NxSelect';
import { NxActionButton } from '@/components/NxActionButton';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxTagCloud, NxMemoryMiniGraph } from '@/components';
import { useAppStore } from '@/store/store-provider';
import { 
  BrainCircuit, 
  Search, 
  Plus, 
  Database, 
  Clock, 
  Filter, 
  Eye, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';

export default function MemoryPage() {
  const memories = useAppStore((state) => state.memories);
  const hydrateMemories = useAppStore((state) => state.hydrateMemories);
  const createMemory = useAppStore((state) => state.createMemory);
  const deleteMemory = useAppStore((state) => state.deleteMemory);
  const resetAllMemories = useAppStore((state) => state.resetAllMemories);
  const addJob = useAppStore((state) => (state as any).addJob);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'semantic' | 'episodic' | 'working'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create form state
  const [newFact, setNewFact] = useState("");
  const [newType, setNewType] = useState<'semantic' | 'episodic' | 'working'>('semantic');
  const [newAgent, setNewAgent] = useState("Manual Core Input");
  const [newTagsString, setNewTagsString] = useState("");

  useEffect(() => {
    const loadMemories = async () => {
      await hydrateMemories();
    };
    void loadMemories();
  }, [hydrateMemories]);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    const tags = newTagsString
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    createMemory({
      fact: newFact.trim(),
      type: newType,
      relevance: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)), // high relevance 0.7 - 1.0
      agentName: newAgent,
      metaTags: tags.length > 0 ? tags : ["manual-entry"]
    });

    addJob?.(`Deploying background neural indexing processes`);

    // Reset Form
    setNewFact("");
    setNewTagsString("");
    setIsModalOpen(false);
  };

  const handleFlushCache = () => {
    resetAllMemories();
    setSearchQuery("");
    addJob?.(`Expelling episodic cache matrices`);
  };

  // Filter memories based on tab and search query
  const filteredMemories = memories.filter(m => {
    const tabMatch = activeTab === 'all' || m.type === activeTab;
    const term = searchQuery.toLowerCase();
    const searchMatch = searchQuery === "" || 
      m.fact.toLowerCase().includes(term) ||
      m.agentName.toLowerCase().includes(term) ||
      m.metaTags.some(t => t.toLowerCase().includes(term));
    
    return tabMatch && searchMatch;
  });

  // Calculate live statistics for Graph
  const semanticCount = memories.filter(m => m.type === 'semantic').length;
  const episodicCount = memories.filter(m => m.type === 'episodic').length;
  const workingCount = memories.filter(m => m.type === 'working').length;
  const miniGraphData = {
    semantic: semanticCount,
    episodic: episodicCount,
    working: workingCount
  };

  // Compile tag frequencies
  const tagCounts: Record<string, number> = {};
  memories.forEach(m => {
    (m.metaTags || []).forEach(t => {
      const clean = t.trim().toLowerCase();
      if (clean) tagCounts[clean] = (tagCounts[clean] || 0) + 1;
    });
  });
  const tagsData = Object.entries(tagCounts).map(([text, count]) => ({ text, count }));

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto animate-in fade-in duration-300">
        
        {/* Header Module */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 md:pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-nexus-blue animate-pulse" />
              Memory Bank Explorer
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Search shared context indexes, isolate conceptual semantic structures, and audit transaction records.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <NxActionButton 
              variant="secondary" 
              size="sm"
              onClick={handleFlushCache}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Flush Cache
            </NxActionButton>
            
            <NxActionButton 
              variant="primary" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Synthesize Knowledge
            </NxActionButton>
          </div>
        </div>

        {/* Dynamic split layout grid: Content stream vs Stats Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Main memory listing stream */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Filtering tab row and search input */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 w-full sm:w-auto">
                {(['all', 'semantic', 'episodic', 'working'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs px-4 py-2 rounded-md font-medium capitalize transition-colors flex-1 sm:flex-initial truncate cursor-pointer ${
                      activeTab === tab 
                        ? "bg-white/10 text-white" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab} {tab === 'all' ? 'Cache' : ''}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-80">
                <NxInput 
                  placeholder="Search facts, agents, metadata tags..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4 text-gray-500" />}
                />
              </div>
            </div>

            {/* Stream Results */}
            {filteredMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMemories.map((mem) => (
                  <NxGlassCard key={mem.id} className="p-5 flex flex-col justify-between hover:border-nexus-blue/20 transition-all duration-300">
                    
                    {/* Character Tag chips */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <NxMemoryChip 
                        label={mem.type.toUpperCase()} 
                        type={mem.type} 
                        relevance={mem.relevance}
                      />
                      <span className="text-[10px] font-mono text-gray-500">{mem.timestamp}</span>
                    </div>

                    {/* Logic Paragraph */}
                    <p className="text-gray-100 text-sm leading-relaxed mb-4">
                      {mem.fact}
                    </p>

                    {/* Footer tags */}
                    <div className="border-t border-white/5 pt-3 mt-auto flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Source:</span>
                        <span className="text-[11px] font-semibold text-gray-300">{mem.agentName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {mem.metaTags.map((tag) => (
                          <button 
                            key={tag} 
                            onClick={() => setSearchQuery(tag)}
                            className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded text-nexus-blue cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => deleteMemory(mem.id)}
                          className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                          title="Erase memory unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </NxGlassCard>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-20 bg-black/10 rounded-2xl border border-white/5">
                <NxEmptyState 
                  title="Memory Bank Inaccessible" 
                  description={searchQuery ? "No contextual facts match your search index." : "Initialize templates or record facts to build indices."}
                  icon={<BrainCircuit className="w-8 h-8 text-gray-500" />}
                  action={
                    <NxActionButton 
                      variant="primary" 
                      size="sm" 
                      onClick={() => {
                        if (searchQuery) setSearchQuery("");
                        else setIsModalOpen(true);
                      }}
                    >
                      {searchQuery ? "Clear Search Index" : "Synthesize First Fact"}
                    </NxActionButton>
                  }
                />
              </div>
            )}

          </div>

          {/* Side panel statistics & visual breakdowns */}
          <div className="space-y-6">
             <NxMemoryMiniGraph data={miniGraphData} totalCount={memories.length} />
             <NxTagCloud tags={tagsData} onTagClick={setSearchQuery} selectedTag={searchQuery} />
          </div>

        </div>

        {/* Synthesize Fact Modal popup */}
        <NxModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Synthesize Strategic Knowledge"
        >
          <form onSubmit={handleAddMemory} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Knowledge snippet facts</label>
              <textarea
                value={newFact}
                onChange={e => setNewFact(e.target.value)}
                placeholder="e.g. Dr Evelyn prefers asynchronous briefing summaries prior to initiating dialouts..."
                className="flex w-full min-h-24 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nexus-blue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Index Classification</label>
                <NxSelect value={newType} onChange={e => setNewType(e.target.value as any)}>
                   <option value="semantic">Semantic (Rules)</option>
                   <option value="episodic">Episodic (Timelines)</option>
                   <option value="working">Working (Dynamic State)</option>
                </NxSelect>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Indexing Agent</label>
                <NxInput value={newAgent} onChange={e => setNewAgent(e.target.value)} placeholder="e.g. Fact Synthesizer Alpha" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Metadata tags (comma separated)</label>
              <NxInput value={newTagsString} onChange={e => setNewTagsString(e.target.value)} placeholder="e.g. network, rate-limitation, exceptions" />
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-white/5 pt-4">
              <NxActionButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </NxActionButton>
              
              <NxActionButton type="submit" variant="primary">
                Index Fact
              </NxActionButton>
            </div>
          </form>
        </NxModal>

      </div>
    </AppLayout>
  );
}
