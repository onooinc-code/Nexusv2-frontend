"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxTabs } from '@/components/NxTabs';
import { useGlobalStore } from '@/store';
import { Cpu, Settings2, Network, Terminal, RefreshCw } from 'lucide-react';
import { NxActionButton } from '@/components/NxActionButton';

import { AgentsTab } from './components/AgentsTab';
import { PersonasTab } from './components/PersonasTab';
import { MCPServersTab } from './components/MCPServersTab';
import { PlaygroundTab } from './components/PlaygroundTab';
import { ToolsLibraryTab } from './components/ToolsLibraryTab';
import { Wrench } from 'lucide-react';

export default function AgentsPage() {
  const { hydrateAgents } = useGlobalStore();
  const [activeTab, setActiveTab] = useState('agents');

  useEffect(() => {
    hydrateAgents();
  }, [hydrateAgents]);

  const tabs = [
    { id: 'agents', label: 'Agents', icon: <Cpu className="w-4 h-4" /> },
    { id: 'personas', label: 'Personas', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
    { id: 'mcp-servers', label: 'MCP Servers', icon: <Network className="w-4 h-4" /> },
    { id: 'playground', label: 'Playground', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto animate-in fade-in duration-500">
        
        {/* Header module */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-nexus-blue animate-pulse" />
              AI Agent Hub
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure cognitive heuristics, personas, model context protocols, and monitor active models.
            </p>
          </div>
          <div className="flex shrink-0">
            <NxActionButton 
              variant="secondary" 
              size="sm"
              onClick={() => hydrateAgents()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh Data
            </NxActionButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <NxTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="underline" 
        />

        {/* Tab Content */}
        <div className="mt-2 flex-1 relative min-h-[500px]">
          {activeTab === 'agents' && (
            <AgentsTab 
              onSelectAgent={(id) => {
                // E.g., open a quick edit drawer or navigate to details
                // For now, switch to Playground if they want to test it
              }} 
            />
          )}
          { activeTab === 'personas' && <PersonasTab /> }
          { activeTab === 'tools' && <ToolsLibraryTab /> }
          { activeTab === 'mcp-servers' && <MCPServersTab /> }
          { activeTab === 'playground' && <PlaygroundTab /> }
        </div>

      </div>
    </AppLayout>
  );
}
