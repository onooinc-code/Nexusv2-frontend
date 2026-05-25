"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxAgentCard } from '@/components/NxAgentCard';
import { NxDrawer } from '@/components/NxDrawer';
import { NxSelect } from '@/components/NxSelect';
import { NxSlider } from '@/components/NxSlider';
import { NxSwitch } from '@/components/NxSwitch';
import { NxInput } from '@/components/NxInput';
import { NxActionButton } from '@/components/NxActionButton';
import { NxEmptyState } from '@/components/NxEmptyState';
import { 
  Cpu, 
  Settings2, 
  Sparkles, 
  Check, 
  Activity, 
  CornerDownRight, 
  Network, 
  HelpCircle,
  Plus, 
  X,
  RefreshCw
} from 'lucide-react';

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline' | 'error';
  tokenUsage: number;
  model: string;
  temperature: number;
  memorySync: boolean;
  capabilities: string[];
}

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "1",
    name: "Data Ingestion Alpha",
    role: "Data Processing & Enrichment",
    status: 'online',
    tokenUsage: 450320,
    model: "gemini-3.5-flash",
    temperature: 0.2,
    memorySync: true,
    capabilities: ["CSV/JSON Parsing", "Entity Extraction", "Pipeline Triggers"]
  },
  {
    id: "2",
    name: "Outreach Coordinator",
    role: "User Engagement & Comms",
    status: 'busy',
    tokenUsage: 120500,
    model: "gemini-3.5-flash",
    temperature: 0.8,
    memorySync: true,
    capabilities: ["Dynamic Greetings", "Draft Auto-reply", "Inbound Triage"]
  },
  {
    id: "3",
    name: "Memory Synthesizer",
    role: "Long-term Archival & Episodic Memory",
    status: 'offline',
    tokenUsage: 89040,
    model: "gemini-3.1-pro-preview",
    temperature: 0.1,
    memorySync: false,
    capabilities: ["Semantic Packing", "Context Merging", "Chunk Retrieval"]
  },
  {
    id: "4",
    name: "Spectral Vision Coprocessor",
    role: "Vision & Image Generation Analysis",
    status: 'online',
    tokenUsage: 231100,
    model: "gemini-2.5-flash-image",
    temperature: 0.5,
    memorySync: false,
    capabilities: ["Object Localization", "OCR Extraction", "Creative Rendering"]
  }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_agents');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_AGENTS;
        }
      }
    }
    return DEFAULT_AGENTS;
  });
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Drawer input form states
  const [editStatus, setEditStatus] = useState<AgentConfig['status']>('online');
  const [editModel, setEditModel] = useState("gemini-3.5-flash");
  const [editTemperature, setEditTemperature] = useState(0.5);
  const [editMemorySync, setEditMemorySync] = useState(true);
  const [editCapabilities, setEditCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_agents');
      if (!saved) {
        localStorage.setItem('nexus_agents', JSON.stringify(DEFAULT_AGENTS));
      }
    }
  }, []);

  const saveToStorage = (updatedList: AgentConfig[]) => {
    setAgents(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_agents', JSON.stringify(updatedList));
    }
  };

  const handleSelectAgent = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (agent) {
      setSelectedAgent(agent);
      setEditStatus(agent.status);
      setEditModel(agent.model);
      setEditTemperature(agent.temperature);
      setEditMemorySync(agent.memorySync);
      setEditCapabilities([...agent.capabilities]);
      setNewCapability("");
      setIsDrawerOpen(true);
    }
  };

  const addCapabilityToken = () => {
    if (newCapability.trim() && !editCapabilities.includes(newCapability.trim())) {
      setEditCapabilities([...editCapabilities, newCapability.trim()]);
      setNewCapability("");
    }
  };

  const removeCapabilityToken = (tag: string) => {
    setEditCapabilities(editCapabilities.filter(c => c !== tag));
  };

  const handleSaveConfig = () => {
    if (!selectedAgent) return;
    setIsDeploying(true);

    // Simulate deploy pipeline latency
    setTimeout(() => {
      const updatedAgents = agents.map(a => {
        if (a.id === selectedAgent.id) {
          return {
            ...a,
            status: editStatus,
            model: editModel,
            temperature: editTemperature,
            memorySync: editMemorySync,
            capabilities: editCapabilities,
            tokenUsage: a.tokenUsage + Math.floor(Math.random() * 500) // increment lightly
          };
        }
        return a;
      });

      saveToStorage(updatedAgents);
      setIsDeploying(false);
      setIsDrawerOpen(false);
    }, 1200);
  };

  const resetAllAgents = () => {
    saveToStorage(DEFAULT_AGENTS);
    setIsDrawerOpen(false);
    setSelectedAgent(null);
  };

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
        
        {/* Header module */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-nexus-blue animate-pulse" />
              AI Agent Workshop
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure cognitive heuristics, monitor active models, and allocate global token budgets.
            </p>
          </div>
          <div className="flex shrink-0">
            <NxActionButton 
              variant="secondary" 
              size="sm"
              onClick={resetAllAgents}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reset Workshop
            </NxActionButton>
          </div>
        </div>

        {/* Global Agent Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/5 pb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Active Agents</span>
            <span className="text-2xl font-bold mt-1 text-gray-100">{agents.filter(a => a.status === 'online' || a.status === 'busy').length} / {agents.length}</span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Model processes are running normally.</span>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Token Expenditures</span>
            <span className="text-2xl font-bold mt-1 text-gray-100">
              {agents.reduce((acc, a) => acc + a.tokenUsage, 0).toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-time cognitive usage tracks.</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Episodic Sync Status</span>
            <span className="text-2xl font-bold mt-1 text-gray-100">
              {agents.filter(a => a.memorySync).length} Syncactive
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
              <Network className="w-3.5 h-3.5" />
              <span>Connected shared cognitive memory loops.</span>
            </div>
          </div>
        </div>

        {/* Workspace Agents List */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-gray-200">Active Allocations</h2>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
              {agents.map((agent) => (
                <NxAgentCard 
                  key={agent.id}
                  id={agent.id}
                  name={agent.name}
                  role={agent.role}
                  status={agent.status}
                  tokenUsage={agent.tokenUsage}
                  onClick={handleSelectAgent}
                />
              ))}
            </div>
          ) : (
            <NxEmptyState 
              title="No Agents Present" 
              description="Deploy default model profiles to start orchestration."
              icon={<Cpu className="w-8 h-8" />}
              action={
                <NxActionButton variant="primary" size="sm" onClick={resetAllAgents}>
                  Re-deploy Standard Agents
                </NxActionButton>
              }
            />
          )}
        </div>

        {/* Configuration Side Drawer */}
        <NxDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-nexus-blue" />
              <span>Configure Heuristics</span>
            </div>
          }
          size="lg"
        >
          {selectedAgent && (
            <div className="flex flex-col gap-6 h-full pb-8">
              
              <div>
                <h3 className="font-semibold text-gray-100 text-lg">{selectedAgent.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedAgent.role}</p>
              </div>

              {/* Status Select */}
              <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activity State</label>
                <NxSelect 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                >
                  <option value="online">ONLINE - Active and polling pipeline queries</option>
                  <option value="busy">BUSY - Processing active inference queue</option>
                  <option value="offline">OFFLINE - Stalled / Hibernating</option>
                  <option value="error">ERROR - Process exception / Requires redeployment</option>
                </NxSelect>
              </div>

              {/* LLM Engine Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inference Core Model</label>
                <NxSelect 
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard speed)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-low latency)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex reasoning)</option>
                  <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (Vision generation context)</option>
                </NxSelect>
              </div>

              {/* Temperature Selector Slider */}
              <div className="flex flex-col gap-1.5 bg-black/20 p-4 rounded-xl border border-white/5">
                <NxSlider 
                  label="Context Softness (Temperature)" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={editTemperature}
                  onChange={(e) => setEditTemperature(parseFloat(e.target.value))}
                  valueDisplay={
                    <span className="font-mono text-nexus-blue font-semibold">
                      {editTemperature.toFixed(1)} {editTemperature <= 0.2 ? '— Deterministic' : editTemperature >= 0.8 ? '— Creative' : '— Balanced'}
                    </span>
                  }
                />
              </div>

              {/* Memory Sync Toggle */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <NxSwitch 
                  label="Episodic Memory Sync loop"
                  checked={editMemorySync}
                  onChange={(e) => setEditMemorySync(e.target.checked)}
                />
                <span className="text-[10px] text-gray-400 mt-1.5 block max-w-xs leading-relaxed pl-14">
                  Stream pipeline event matrices automatically to cognitive memory, compiling relational history tokens globally.
                </span>
              </div>

              {/* Capabilities Editor */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Operational Capabilities</label>
                <div className="flex flex-wrap gap-1.5 min-h-12 bg-white/5 border border-white/10 p-2.5 rounded-lg">
                  {editCapabilities.map((cap) => (
                    <span 
                      key={cap} 
                      className="inline-flex items-center gap-1 text-[11px] bg-white/10 border border-white/5 px-2 py-1 rounded-md text-gray-300 hover:border-red-500/30 transition-colors"
                    >
                      {cap}
                      <button 
                        type="button" 
                        onClick={() => removeCapabilityToken(cap)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {editCapabilities.length === 0 && (
                    <span className="text-xs text-gray-500 italic p-1">No custom capability nodes.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <NxInput 
                    placeholder="New capability node..." 
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapabilityToken())}
                    className="h-8 text-xs bg-white/5"
                  />
                  <NxActionButton 
                    variant="secondary" 
                    size="sm" 
                    type="button"
                    onClick={addCapabilityToken}
                    className="h-8 shrink-0 px-2 flex items-center justify-center bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </NxActionButton>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 mt-auto border-t border-white/5 pt-4">
                <NxActionButton 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-1/3"
                >
                  Cancel
                </NxActionButton>
                
                <NxActionButton 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSaveConfig}
                  isLoading={isDeploying}
                  className="flex-1"
                >
                  Deploy Settings
                </NxActionButton>
              </div>

            </div>
          )}
        </NxDrawer>

      </div>
    </AppLayout>
  );
}
