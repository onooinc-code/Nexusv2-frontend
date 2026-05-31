import React, { useState } from 'react';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { Play, Plus, Trash2, Clock, CheckCircle2, XCircle, Copy, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api/client';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export function ApiTesterPanel() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ id: '1', key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addHeader = () => setHeaders([...headers, { id: generateId(), key: '', value: '' }]);
  const removeHeader = (id: string) => setHeaders(headers.filter(h => h.id !== id));
  const updateHeader = (id: string, field: 'key' | 'value', val: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const handleSend = async () => {
    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedBody = body;
      // Try parsing JSON if body is present and not a GET/DELETE request
      if (body && !['GET', 'DELETE'].includes(method)) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          // Send as raw string if JSON parsing fails
        }
      }

      const res = await apiClient.post('/settings/system/api-proxy', {
        url,
        method,
        headers,
        body: parsedBody
      });
      
      setResponse(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send request');
      if (err?.response?.data?.data) {
        setResponse(err.response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-400';
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-blue-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Top Bar: URL and Method */}
      <NxGlassCard className="p-4 flex flex-col md:flex-row items-center gap-3 bg-black/40 border-white/10">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-semibold text-nexus-blue focus:outline-none focus:border-nexus-blue/50"
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
            <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
          ))}
        </select>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/users"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-nexus-blue/50 font-mono"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        
        <NxActionButton 
          variant="primary" 
          onClick={handleSend} 
          isLoading={loading}
          leftIcon={<Play className="w-4 h-4" />}
          className="px-8"
        >
          Send
        </NxActionButton>
      </NxGlassCard>

      {/* Main Content Area: Split View for Request and Response */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        
        {/* Left Side: Request Config */}
        <NxGlassCard className="flex-1 flex flex-col bg-black/40 border-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            {(['headers', 'body'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-nexus-blue text-nexus-blue' 
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {tab === 'headers' ? 'Headers' : 'Body'}
                {tab === 'headers' && headers.length > 0 && (
                  <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{headers.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {activeTab === 'headers' && (
              <div className="flex flex-col gap-2">
                {headers.map((h, i) => (
                  <div key={h.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Key"
                      value={h.key}
                      onChange={(e) => updateHeader(h.id, 'key', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-nexus-blue/50"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => updateHeader(h.id, 'value', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-nexus-blue/50"
                    />
                    <button 
                      onClick={() => removeHeader(h.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addHeader}
                  className="mt-2 text-sm text-nexus-blue hover:text-nexus-blue/80 flex items-center gap-1.5 w-fit"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Header
                </button>
              </div>
            )}

            {activeTab === 'body' && (
              <div className="h-full flex flex-col">
                <div className="text-xs text-gray-500 mb-2 flex justify-between">
                  <span>Enter JSON or raw text payload</span>
                  {['GET', 'DELETE'].includes(method) && <span className="text-yellow-500">Body is usually ignored for {method}</span>}
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"{\n  \"key\": \"value\"\n}"}
                  className="flex-1 w-full bg-black/60 border border-white/10 rounded-lg p-3 text-sm text-green-400 font-mono focus:outline-none focus:border-nexus-blue/50 resize-none"
                />
              </div>
            )}
          </div>
        </NxGlassCard>

        {/* Right Side: Response View */}
        <NxGlassCard className="flex-1 flex flex-col bg-black/40 border-white/10 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-black/20">
            <h3 className="text-sm font-semibold text-gray-300">Response</h3>
            {response && (
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1">
                  Status: 
                  <span className={`font-bold ml-1 ${getStatusColor(response.status)} flex items-center gap-1`}>
                    {response.status ? (response.status < 400 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />) : ''}
                    {response.status || 'ERROR'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3 h-3" />
                  {response.latency ? `${response.latency} ms` : '—'}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto relative bg-[#0a0a0a]">
            {error && !response && (
              <div className="flex items-start gap-2 text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-mono">{error}</span>
              </div>
            )}

            {!response && !error && !loading && (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                Enter a URL and click Send to see the response.
              </div>
            )}

            {loading && (
              <div className="h-full flex items-center justify-center text-nexus-blue">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-nexus-blue border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Awaiting response...</span>
                </div>
              </div>
            )}

            {response && (
              <div className="group h-full">
                <button 
                  onClick={() => navigator.clipboard.writeText(typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : String(response.body))}
                  className="absolute top-6 right-6 p-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words">
                  {typeof response.body === 'object' 
                    ? JSON.stringify(response.body, null, 2) 
                    : String(response.body || '')}
                </pre>
              </div>
            )}
          </div>
        </NxGlassCard>
      </div>
    </div>
  );
}
