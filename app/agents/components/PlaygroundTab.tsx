"use client";

import React, { useState } from 'react';
import { NxSelect } from '@/components/NxSelect';
import { NxInput } from '@/components/NxInput';
import { NxActionButton } from '@/components/NxActionButton';
import { useGlobalStore } from '@/store';
import { Activity, Play, Terminal } from 'lucide-react';

export const PlaygroundTab: React.FC = () => {
  const { agents, simulateAgent, runAgent, fetchAgentStatus } = useGlobalStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [taskInput, setTaskInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const handleSimulate = async () => {
    if (!selectedAgentId || !taskInput) return;
    setIsSimulating(true);
    try {
      const res = await simulateAgent(selectedAgentId, { task: taskInput, context: {} });
      setLogs(prev => [...prev, { type: 'simulate', result: res }]);
      await fetchAgentStatus(selectedAgentId);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, { type: 'error', error: String(e) }]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRun = async () => {
    if (!selectedAgentId || !taskInput) return;
    setIsSimulating(true);
    try {
      const res = await runAgent(selectedAgentId, { task: taskInput, context: {} });
      setLogs(prev => [...prev, { type: 'run', result: res }]);
      await fetchAgentStatus(selectedAgentId);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, { type: 'error', error: String(e) }]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full animate-in fade-in duration-500 h-full min-h-[500px]">
      
      {/* Settings Panel */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 bg-white/5 border border-white/10 rounded-xl p-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-nexus-blue" />
            Execution Parameters
          </h3>
          
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Target Agent</label>
            <NxSelect 
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">-- Select an Agent --</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </NxSelect>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Task Prompt</label>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:border-nexus-blue focus:ring-1 focus:ring-nexus-blue transition-all min-h-[120px] resize-none"
              placeholder="Enter the task description or input for the agent..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            <NxActionButton 
              variant="secondary" 
              className="w-full justify-center" 
              onClick={handleSimulate} 
              isLoading={isSimulating}
              leftIcon={<Activity className="w-4 h-4" />}
              disabled={!selectedAgentId || !taskInput}
            >
              Simulate Execution
            </NxActionButton>
            <NxActionButton 
              variant="primary" 
              className="w-full justify-center" 
              onClick={handleRun} 
              isLoading={isSimulating}
              leftIcon={<Play className="w-4 h-4" />}
              disabled={!selectedAgentId || !taskInput}
            >
              Run Real Execution
            </NxActionButton>
          </div>
        </div>
      </div>

      {/* Execution Logs / Output Panel */}
      <div className="w-full md:w-2/3 bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-widest">Execution Output</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs flex flex-col gap-2">
          {logs.length === 0 ? (
            <div className="text-gray-500 h-full flex items-center justify-center italic">
              Waiting for execution...
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className={`p-3 rounded-md border ${log.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-nexus-blue/5 border-nexus-blue/20 text-blue-200'}`}>
                <div className="font-semibold mb-1 opacity-75">
                  [{log.type.toUpperCase()}] {new Date().toLocaleTimeString()}
                </div>
                <pre className="whitespace-pre-wrap break-words">
                  {log.error ? log.error : JSON.stringify(log.result, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
