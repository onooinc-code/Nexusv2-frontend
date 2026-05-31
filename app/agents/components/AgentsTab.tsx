"use client";

import React from 'react';
import { NxAgentCard } from '@/components/NxAgentCard';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxActionButton } from '@/components/NxActionButton';
import { useGlobalStore } from '@/store';
import { Cpu, Activity } from 'lucide-react';

interface AgentsTabProps {
  onSelectAgent: (id: string) => void;
}

export const AgentsTab: React.FC<AgentsTabProps> = ({ onSelectAgent }) => {
  const { agents, loading, hydrateAgents } = useGlobalStore();

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
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
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Executions</span>
          <span className="text-2xl font-bold mt-1 text-gray-100">
            {agents.reduce((acc, a) => acc + (a.tokenUsage || 0), 0).toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-time cognitive usage tracks.</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Quarantined Agents</span>
          <span className="text-2xl font-bold mt-1 text-gray-100">
            {agents.filter(a => a.status === 'error').length}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Agents isolated by Kill-Switch.</span>
          </div>
        </div>
      </div>

      {/* Workspace Agents List */}
      <div>
        <h2 className="text-lg font-medium mb-4 text-gray-200">Registered Agents</h2>
        {loading.agents ? (
          <div className="text-gray-400 text-sm py-4">Loading agents...</div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <NxAgentCard 
                key={agent.id}
                id={agent.id}
                name={agent.name}
                role={agent.role}
                status={agent.status as any}
                tokenUsage={agent.tokenUsage || 0}
                onClick={onSelectAgent}
              />
            ))}
          </div>
        ) : (
          <NxEmptyState 
            title="No Agents Present" 
            description="Deploy agent personas via API or sync the database to start orchestration."
            icon={<Cpu className="w-8 h-8" />}
            action={
              <NxActionButton variant="primary" size="sm" onClick={() => hydrateAgents()}>
                Sync Registry
              </NxActionButton>
            }
          />
        )}
      </div>
    </div>
  );
};
