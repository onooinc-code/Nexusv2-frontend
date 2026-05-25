"use client";

import React, { useState } from 'react';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxInput } from '@/components/NxInput';
import { Network, Play, CheckCircle, XCircle, RotateCw, Edit2, PlayCircle, Settings2, Globe } from 'lucide-react';
import { useAppStore } from '@/store/store-provider';

interface ApiDefinition {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  defaultUrl: string;
  url: string;
  apiKey: string;
  requiredHeaders: string[];
  status: 'idle' | 'testing' | 'success' | 'error';
  lastResponse?: string;
  statusCode?: number;
}

const DEFAULT_APIS: ApiDefinition[] = [
  {
    id: "gemini",
    name: "Gemini AI API",
    description: "Core intelligence and natural language processing.",
    method: "POST",
    defaultUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    apiKey: "",
    requiredHeaders: ["Content-Type: application/json"],
    status: 'idle'
  },
  {
    id: "weather",
    name: "Weather Context API",
    description: "Environmental data for agent context generation.",
    method: "GET",
    defaultUrl: "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m",
    url: "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m",
    apiKey: "",
    requiredHeaders: [],
    status: 'idle'
  },
  {
    id: "workflow-runner",
    name: "Nexus Remote Executor",
    description: "External pipeline runner endpoint.",
    method: "POST",
    defaultUrl: "https://api.nexus-core.local/v1/execute",
    url: "https://api.nexus-core.local/v1/execute",
    apiKey: "",
    requiredHeaders: ["Authorization: Bearer <key>"],
    status: 'idle'
  }
];

export default function ApiTesterPage() {
  const [apis, setApis] = useState<ApiDefinition[]>(DEFAULT_APIS);
  const [testingAll, setTestingAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTestApi = async (id: string) => {
    setApis(prev => prev.map(api => api.id === id ? { ...api, status: 'testing', lastResponse: undefined, statusCode: undefined } : api));
    
    // Simulate real network request using the fetch API if possible
    const targetApi = apis.find(a => a.id === id);
    if (!targetApi) return;

    try {
      let finalUrl = targetApi.url;
      if (targetApi.apiKey && !finalUrl.includes('key=')) {
         finalUrl += `${finalUrl.includes('?') ? '&' : '?'}key=${targetApi.apiKey}`;
      }

      const res = await fetch(finalUrl, { 
        method: targetApi.method,
        // Using a basic content payload for POST just to avoid 400s immediately if possible, though external APIs might still fail
        body: targetApi.method === 'POST' ? JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }) : undefined,
        headers: targetApi.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined
      }).catch(e => {
         throw new Error("Network Fetch Failed: " + e.message);
      });

      let responseText = "";
      if (res.headers.get('content-type')?.includes('application/json')) {
         responseText = JSON.stringify(await res.json(), null, 2);
      } else {
         responseText = await res.text();
      }

      setApis(prev => prev.map(api => 
        api.id === id ? { 
          ...api, 
          status: res.ok ? 'success' : 'error',
          statusCode: res.status,
          lastResponse: responseText.slice(0, 500) + (responseText.length > 500 ? '...\n[Truncated]' : '')
        } : api
      ));

    } catch (e: any) {
      setApis(prev => prev.map(api => 
        api.id === id ? { 
          ...api, 
          status: 'error',
          statusCode: 0,
          lastResponse: e.message || "Connection Refused / CORS Error"
        } : api
      ));
    }
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    for (const api of apis) {
      await handleTestApi(api.id);
    }
    setTestingAll(false);
  };

  const updateApi = (id: string, updates: Partial<ApiDefinition>) => {
    setApis(prev => prev.map(api => api.id === id ? { ...api, ...updates } : api));
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 w-full max-w-5xl mx-auto overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
            <Network className="w-6 h-6 text-nexus-blue" />
            API & Integrations Hub
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure, authenticate, and test all external endpoints required by Nexus Core.
          </p>
        </div>
        <div>
          <NxActionButton 
            variant="primary" 
            size="sm"
            onClick={handleTestAll}
            disabled={testingAll}
            leftIcon={testingAll ? <RotateCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          >
            {testingAll ? 'Testing Sequence...' : 'Test All Services'}
          </NxActionButton>
        </div>
      </div>

      <div className="space-y-6">
        {apis.map((api) => (
          <NxGlassCard key={api.id} className="p-6 overflow-hidden relative">
             <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left controls */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                     <div>
                       <div className="flex items-center gap-2">
                         <h2 className="text-lg font-semibold text-white">{api.name}</h2>
                         <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border ${
                           api.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                           api.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           'bg-purple-500/10 text-purple-400 border-purple-500/20'
                         }`}>
                           {api.method}
                         </span>
                       </div>
                       <p className="text-sm text-gray-400 mt-1">{api.description}</p>
                     </div>
                     <NxActionButton 
                       variant="secondary" 
                       size="sm"
                       onClick={() => setEditingId(editingId === api.id ? null : api.id)}
                     >
                       <Settings2 className="w-4 h-4" />
                     </NxActionButton>
                  </div>

                  {editingId === api.id ? (
                    <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/5 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Base URL Endpoint</label>
                        <NxInput 
                          value={api.url} 
                          onChange={(e) => updateApi(api.id, { url: e.target.value })}
                          icon={<Globe className="w-4 h-4" />}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">API Key (Optional / Param)</label>
                        <NxInput 
                          type="password"
                          value={api.apiKey} 
                          onChange={(e) => updateApi(api.id, { apiKey: e.target.value })}
                          placeholder="Paste token or key here..."
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                         <NxActionButton size="sm" variant="primary" onClick={() => setEditingId(null)}>Done</NxActionButton>
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-xs bg-black/40 p-3 rounded-lg border border-white/5 overflow-x-auto text-gray-300">
                      <span className="text-gray-500">{api.method}</span> {api.url}
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-3">
                     <NxActionButton 
                       variant="primary" 
                       size="sm" 
                       className="w-32"
                       onClick={() => handleTestApi(api.id)}
                       disabled={api.status === 'testing' || testingAll}
                       leftIcon={api.status === 'testing' ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                     >
                        {api.status === 'testing' ? 'Connecting' : 'Run Test'}
                     </NxActionButton>
                     
                     {/* Status indicator inline */}
                     {api.status !== 'idle' && api.status !== 'testing' && (
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${api.status === 'success' ? 'text-success' : 'text-error'}`}>
                          {api.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {api.status === 'success' ? `Success (${api.statusCode})` : `Failed (${api.statusCode})`}
                        </div>
                     )}
                  </div>
                </div>

                {/* Right logs preview */}
                <div className="flex-1 bg-black/40 rounded-lg border border-white/5 p-4 flex flex-col">
                   <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Diagnostic Output</h3>
                   <div className="flex-1 min-h-[120px] font-mono text-xs text-gray-400 overflow-y-auto whitespace-pre-wrap">
                     {api.status === 'idle' && <span className="opacity-50 italic">Awaiting manual or sequenced execution...</span>}
                     {api.status === 'testing' && <span className="text-nexus-blue animate-pulse">Establishing secure connection...</span>}
                     {(api.status === 'success' || api.status === 'error') && (
                       <div className={api.status === 'error' ? 'text-error/80' : 'text-gray-300'}>
                         {api.lastResponse || "No bodily response returned."}
                       </div>
                     )}
                   </div>
                </div>
             </div>
          </NxGlassCard>
        ))}
      </div>
    </div>
  );
}
