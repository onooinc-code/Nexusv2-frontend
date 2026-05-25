"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxInput } from '@/components/NxInput';
import { NxActionButton } from '@/components/NxActionButton';
import { Terminal, Search, Pause, Play, Trash2, AlertOctagon, RefreshCw, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface FullLog {
  id: number;
  created_at: string;
  level: string;
  channel: string | null;
  message: string;
  context: Record<string, any> | null;
}

const TEMPLATE_LOGS: FullLog[] = [];

export default function LogsPage() {
  const [logs, setLogs] = useState<FullLog[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<FullLog | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/logs/channels').then((res) => {
      setChannels(res.data?.data || []);
    }).catch(console.error);
  }, []);

  const fetchLogs = useMemo(() => {
    return async (force = false) => {
      if (isPaused && !force) return;
      setLoading(true);
      setErrorText(null);

      try {
        const response = await apiClient.get('/logs', {
          params: {
            level: levelFilter === 'all' ? undefined : levelFilter,
            channel: channelFilter === 'all' ? undefined : channelFilter,
            search: searchQuery || undefined,
            per_page: 50,
            page,
          },
        });

        const data = response.data?.data ?? [];
        setLogs(data);
        setTotalCount(response.data?.pagination?.total ?? data.length);
        setLastPage(response.data?.pagination?.last_page ?? 1);
        
        if (data.length > 0 && (!selectedLog || !data.find((l: FullLog) => l.id === selectedLog.id))) {
          setSelectedLog(data[0]);
        } else if (data.length === 0) {
          setSelectedLog(null);
        }
      } catch (error: any) {
        setErrorText(error?.message ?? 'Unable to load logs from backend.');
        setLogs([]);
        setTotalCount(0);
        setLastPage(1);
      } finally {
        setLoading(false);
      }
    };
  }, [levelFilter, channelFilter, searchQuery, page, isPaused, selectedLog]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Polling for live logs if not paused and on page 1
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && page === 1) {
      interval = setInterval(() => {
        fetchLogs(false);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPaused, page, fetchLogs]);

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    try {
      await apiClient.post('/logs/clear');
      setLogs([]);
      setSelectedLog(null);
      setTotalCount(0);
      setPage(1);
    } catch {
      setErrorText('Log clear failed.');
    }
  };

  const deleteSingleLog = async (id: number) => {
    try {
      await apiClient.delete(`/logs/${id}`);
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
      fetchLogs(true);
    } catch {
      setErrorText('Failed to delete log.');
    }
  };

  const refreshLogs = () => {
    fetchLogs(true);
  };

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(lastPage, p + 1));

  return (
    <AppLayout>
      <div className='p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2'>
              <Terminal className='w-6 h-6 text-nexus-blue animate-pulse' />
              Live Telemetry Viewer
            </h1>
            <p className='text-sm text-gray-400 mt-1'>
              Analyze core message buses, inspect event structures, and audit system logs.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2 shrink-0'>
            <NxActionButton
              variant='secondary'
              size='sm'
              onClick={() => setIsPaused(!isPaused)}
              leftIcon={isPaused ? <Play className='w-4 h-4' /> : <Pause className='w-4 h-4' />}
            >
              {isPaused ? 'Resume Feed' : 'Pause Feed'}
            </NxActionButton>

            <NxActionButton
              variant='secondary'
              size='sm'
              onClick={clearLogs}
              leftIcon={<Trash2 className='w-4 h-4' />}
            >
              Clear Logs
            </NxActionButton>

            <NxActionButton
              variant='secondary'
              size='sm'
              onClick={refreshLogs}
              leftIcon={<RefreshCw className='w-4 h-4' />}
            >
              Refresh
            </NxActionButton>
          </div>
        </div>

        {errorText ? (
          <div className='bg-amber-500/10 border border-amber-500/20 text-amber-100 text-sm p-3 rounded-xl'>
            {errorText}
          </div>
        ) : null}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 flex flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5'>
              <div className='flex bg-black/30 p-1 rounded-lg border border-white/15 w-full sm:w-auto'>
                {(['all', 'info', 'warning', 'error', 'debug'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setLevelFilter(lvl);
                      setPage(1);
                    }}
                    className={`text-[10px] px-3 py-1.5 rounded font-mono uppercase font-bold transition-all flex-1 sm:flex-initial tracking-wider ${
                      levelFilter === lvl
                        ? lvl === 'error'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                          : lvl === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className='flex gap-2 w-full sm:w-auto flex-1 justify-end'>
                <select
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value);
                    setPage(1);
                  }}
                  className='bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-nexus-blue'
                >
                  <option value="all">All Channels</option>
                  {channels.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className='w-full sm:w-48'>
                  <NxInput
                    placeholder='Filter logs...'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    icon={<Search className='w-4 h-4 text-gray-500' />}
                  />
                </div>
              </div>
            </div>

            <NxGlassCard className='p-4 flex flex-col h-[460px] bg-black/60 border-white/10 font-mono text-xs text-gray-300 relative overflow-hidden'>
              <div className='shrink-0 flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[10px] text-gray-500'>
                <div className='flex items-center gap-1.5 font-semibold'>
                  <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isPaused ? 'STREAM PAUSED — COGNITIVE FEED ON HOLD' : 'STREAM ACTIVE — MONITORING PIPELINE INTELLIGENCE'}</span>
                </div>
                <span>
                  DISPLAYING {logs.length} OF {totalCount} UNIT PROCESSES
                </span>
              </div>

              <div className='flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin'>
                {loading && logs.length === 0 ? (
                  <div className='h-full flex items-center justify-center text-gray-500'>Loading logs...</div>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`flex gap-3 hover:bg-white/5 p-1.5 rounded transition-all cursor-pointer items-start select-none ${
                        selectedLog?.id === log.id ? 'bg-white/10 border-l-2 border-nexus-blue pl-1' : ''
                      }`}
                    >
                      <span suppressHydrationWarning className='text-gray-500 shrink-0 w-36 overflow-hidden text-ellipsis whitespace-nowrap'>
                        [{new Date(log.created_at).toLocaleTimeString()}]
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 tracking-widest w-16 text-center ${
                        log.level === 'error' || log.level === 'critical' || log.level === 'alert' || log.level === 'emergency'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                          : log.level === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                      }`}>
                        {log.level}
                      </span>
                      <span className='text-gray-400 font-semibold shrink-0 w-24 overflow-hidden text-ellipsis whitespace-nowrap'>
                        [{log.channel || 'system'}]
                      </span>
                      <span className='text-gray-200 flex-1 truncate'>{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className='h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 gap-1 pt-24'>
                    <Terminal className='w-8 h-8 opacity-30 mb-2' />
                    <span>No process entries found matching filters.</span>
                  </div>
                )}
                <div />
              </div>

              {/* Pagination controls */}
              <div className='shrink-0 flex items-center justify-between border-t border-white/5 pt-2 mt-2 text-[10px] text-gray-500'>
                <button 
                  onClick={handlePrevPage} 
                  disabled={page <= 1}
                  className='flex items-center gap-1 hover:text-white disabled:opacity-50 disabled:hover:text-gray-500'
                >
                  <ChevronLeft className='w-4 h-4' /> Prev
                </button>
                <span>Page {page} of {lastPage}</span>
                <button 
                  onClick={handleNextPage} 
                  disabled={page >= lastPage}
                  className='flex items-center gap-1 hover:text-white disabled:opacity-50 disabled:hover:text-gray-500'
                >
                  Next <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </NxGlassCard>
          </div>

          <div className='lg:col-span-1 flex flex-col gap-4'>
            <h2 className='text-md font-semibold text-gray-300 font-sans flex items-center gap-2'>
              <Info className='w-4 h-4 text-nexus-blue' />
              Event Trace Inspection
            </h2>

            {selectedLog ? (
              <NxGlassCard className='p-5 flex flex-col h-[526px] bg-black/40 border-white/5 animate-in fade-in zoom-in-95 duration-200 relative'>
                
                <button
                  onClick={() => deleteSingleLog(selectedLog.id)}
                  className='absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors'
                  title="Delete this log"
                >
                  <Trash2 className='w-4 h-4' />
                </button>

                <div className='flex justify-between items-start border-b border-white/5 pb-3.5 mb-3.5 pr-8'>
                  <div>
                    <span className='text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block'>CHANNEL</span>
                    <span className='text-sm font-semibold text-gray-200 font-sans mt-0.5 block'>{selectedLog.channel || 'system'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                    selectedLog.level === 'error' || selectedLog.level === 'critical'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                      : selectedLog.level === 'warning'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                  }`}>
                    {selectedLog.level}
                  </span>
                </div>

                <div className='flex flex-col gap-3.5 flex-1'>
                  <div>
                    <span className='text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block'>TIMESTAMP</span>
                    <span suppressHydrationWarning className='text-xs font-mono text-gray-300 tracking-wide'>{new Date(selectedLog.created_at).toLocaleString()}</span>
                  </div>

                  <div>
                    <span className='text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block'>MESSAGE STRING</span>
                    <span className='text-xs font-sans text-gray-200 leading-relaxed block mt-1'>{selectedLog.message}</span>
                  </div>

                  <div className='flex-1 flex flex-col'>
                    <span className='text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block mb-1.5'>CONTEXT METADATA JSON</span>
                    <pre className='flex-1 bg-black/60 p-3 rounded-lg border border-white/10 font-mono text-[11px] text-nexus-blue overflow-auto max-h-[220px] select-all scrollbar-thin'>
                      {JSON.stringify(selectedLog.context || {}, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className='border-t border-white/5 pt-4 mt-4 shrink-0'>
                  <span className='text-[10px] text-gray-500 leading-relaxed block text-center font-sans'>
                    Trace records assist cognitive health mapping routines for running system state indices.
                  </span>
                </div>
              </NxGlassCard>
            ) : (
              <div className='flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-2xl h-[526px] bg-black/10 text-gray-500 gap-1.5'>
                <Terminal className='w-8 h-8 opacity-30 animate-pulse text-nexus-blue' />
                <span className='text-sm font-medium'>No log selected</span>
                <span className='text-xs max-w-[200px] leading-relaxed'>
                  Click on any interactive activity item on the left to inspect variables.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
