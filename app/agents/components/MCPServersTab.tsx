"use client";

import React, { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store';
import { Plus, Trash2, Network, Loader2, Link2, Link2Off, Database } from 'lucide-react';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';

export function MCPServersTab() {
  const { 
    mcpServers, 
    hydrateMCPServers, 
    createMCPServer, 
    deleteMCPServer, 
    connectMCPServer, 
    disconnectMCPServer, 
    loading 
  } = useGlobalStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'local',
    connection_config: '{\n  "command": "node",\n  "args": ["server.js"]\n}',
  });

  const isLoading = loading['mcpServers'] || false;

  useEffect(() => {
    hydrateMCPServers();
  }, [hydrateMCPServers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.connection_config) return;
    
    try {
      const configObj = JSON.parse(formData.connection_config);
      await createMCPServer({
        name: formData.name,
        type: formData.type as 'local' | 'remote',
        connection_config: configObj,
      });
      
      setFormData({ name: '', type: 'local', connection_config: '{\n  "command": "node",\n  "args": ["server.js"]\n}' });
      setIsCreating(false);
    } catch (e) {
      alert("Invalid JSON format in connection config.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-400" />
            MCP Server Registry
          </h2>
          <p className="text-sm text-gray-400">
            Connect Model Context Protocol servers to grant agents external tool and resource access.
          </p>
        </div>
        <NxActionButton 
          variant="primary" 
          onClick={() => setIsCreating(!isCreating)}
          leftIcon={isCreating ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {isCreating ? 'Cancel' : 'Register Server'}
        </NxActionButton>
      </div>

      {isCreating && (
        <NxGlassCard className="border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <h3 className="text-sm font-medium text-gray-200 border-b border-white/5 pb-2">
              Register New MCP Server
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-medium">Server Identifier</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-nexus-blue focus:outline-none transition-colors"
                  placeholder="e.g. google-drive-mcp"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-medium">Server Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-nexus-blue focus:outline-none transition-colors"
                >
                  <option value="local">Local (Stdio)</option>
                  <option value="remote">Remote (SSE / WebSocket)</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium flex justify-between">
                <span>Connection Configuration (JSON)</span>
                {formData.type === 'remote' && <span className="text-emerald-400/70">Requires "url" field</span>}
                {formData.type === 'local' && <span className="text-emerald-400/70">Requires "command" & "args"</span>}
              </label>
              <textarea 
                value={formData.connection_config}
                onChange={(e) => setFormData({...formData, connection_config: e.target.value})}
                className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-nexus-blue focus:outline-none transition-colors font-mono min-h-[120px] resize-y"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <NxActionButton type="submit" variant="primary" size="sm">
                Save Server Config
              </NxActionButton>
            </div>
          </form>
        </NxGlassCard>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 text-nexus-blue animate-spin" />
        </div>
      ) : mcpServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
          <Database className="w-8 h-8 mb-3 opacity-50" />
          <p>No MCP servers registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {mcpServers.map((server) => {
            const isOnline = server.status === 'online' || server.status === 'connected';
            
            return (
              <NxGlassCard key={server.id} className="hover:border-white/20 transition-all duration-300">
                <div className="p-5 flex flex-col h-full gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/5 flex items-center justify-center">
                        <Network className={`w-5 h-5 ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-100 flex items-center gap-2">
                          {server.name}
                          <span className="text-[10px] uppercase bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                            {server.type}
                          </span>
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                          <span className={isOnline ? 'text-emerald-400' : 'text-red-400'}>
                            {server.status || 'offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-3 text-xs text-gray-400 font-mono overflow-auto max-h-[100px] border border-white/5">
                    <pre>{JSON.stringify(server.connection_config, null, 2)}</pre>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                    <button 
                      onClick={() => deleteMCPServer(server.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Remove Server"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    {isOnline ? (
                      <NxActionButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => disconnectMCPServer(server.name)}
                        leftIcon={<Link2Off className="w-3.5 h-3.5" />}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Disconnect
                      </NxActionButton>
                    ) : (
                      <NxActionButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => connectMCPServer(server.name)}
                        leftIcon={<Link2 className="w-3.5 h-3.5" />}
                      >
                        Connect
                      </NxActionButton>
                    )}
                  </div>
                </div>
              </NxGlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
