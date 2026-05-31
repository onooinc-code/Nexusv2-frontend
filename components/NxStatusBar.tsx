"use client";

import React, { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { NxConnectionDot } from './NxConnectionDot';
import { usePathname, useSearchParams } from 'next/navigation';
import { NxModal } from './NxModal';
import { useGlobalStore } from '@/store';
import { GlobalJobMonitor } from './GlobalJobMonitor';
import { useWebSocket } from '@/hooks/useWebSocket';
import apiClient from '@/lib/api/client';
import { isAuthenticated, getToken } from '@/lib/auth';
import { Bell } from 'lucide-react';

const BOOT_LOGS = [
  "Initializing Nexus Core...",
  "Loading cognitive contexts...",
  "Verifying subsystem integrity...",
  "Synchronizing telemetry streams...",
  "System normal."
];

const NAV_LOGS = [
  "Requesting interface module...",
  "Resolving secure routes...",
  "Unpacking UI payload...",
  "Compiling visual matrices...",
  "Ready."
];

const pageNameMap: Record<string, string> = {
  '/': 'NexusHub',
  '/conversations': 'ConversationsHub',
  '/contacts': 'ContactsHub',
  '/agents': 'AgentsHub',
  '/workflows': 'WorkflowsHub',
  '/tasks': 'TasksHub',
  '/scheduler': 'SchedulerHub',
  '/memory': 'MemoryHub',
  '/apis': 'APIsHub',
  '/logs': 'LogsHub',
  '/ai-models': 'AIModelsHub',
  '/settings': 'SettingsHub',
};

function StatusBarContent({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navLoading, setNavLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState('System Normal');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsText, setLogsText] = useState<string | null>(null);
  const [health, setHealth] = useState({ status: 'unknown', app: 'Nexus Backend', timestamp: '--', details: {} as any });
  const [taskStats, setTaskStats] = useState<Record<string, any> | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const progressRef = useRef<{ timer: any; interval: any }>({ timer: null, interval: null });
  const { connectionStatus } = useWebSocket();
  const setJobMonitorOpen = useGlobalStore((s) => s.setJobMonitorOpen);
  const isJobMonitorOpen = useGlobalStore((s) => s.isJobMonitorOpen);
  const setNotificationDrawerOpen = useGlobalStore((s) => s.setNotificationDrawerOpen);
  const isNotificationDrawerOpen = useGlobalStore((s) => s.isNotificationDrawerOpen);

  const pageName = useMemo(() => {
    if (!pathname) return 'NexusHub';
    const match = Object.keys(pageNameMap).find((key) => pathname === key || pathname.startsWith(`${key}/`));
    return match ? pageNameMap[match] : 'Nexus Workspace';
  }, [pathname]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const backendStatus = useMemo<'online' | 'offline' | 'error' | 'unknown'>(() => {
    if (!mounted) return 'unknown';
    if (statusError) return 'error';
    if (health.status === 'healthy') return 'online';
    if (health.status === 'unknown') return 'unknown';
    return 'offline';
  }, [mounted, health.status, statusError]);

  const reverbStatus = useMemo<'online' | 'offline' | 'error' | 'unknown' | 'connecting'>(() => {
    if (!mounted) return 'unknown';
    if (!connectionStatus) return 'unknown';
    if (connectionStatus === 'connected') return 'online';
    if (connectionStatus === 'connecting') return 'connecting';
    if (connectionStatus === 'disconnected' || connectionStatus === 'unavailable') return 'offline';
    return 'offline';
  }, [mounted, connectionStatus]);

  const queueStatus = useMemo<'online' | 'offline' | 'error' | 'unknown'>(() => {
    if (!mounted) return 'unknown';
    if (!taskStats) return 'unknown';
    const pending = taskStats?.pending ?? 0;
    const running = taskStats?.running ?? 0;
    return (pending > 0 || running > 0) ? 'online' : 'offline';
  }, [mounted, taskStats]);

  const authStatus = useMemo<'online' | 'offline' | 'error' | 'unknown'>(() => {
    if (!mounted) return 'unknown';
    const token = getToken();
    return token ? 'online' : 'offline';
  }, [mounted]);

  const refreshStatus = async () => {
    try {
      const response = await apiClient.get('/v1/health');
      const data = response.data?.data ?? response.data;
      setHealth({
        status: data.status || 'unhealthy',
        app: data.app || 'Nexus Backend',
        timestamp: data.timestamp || new Date().toISOString(),
        details: data,
      });
      setStatusError(null);
    } catch (error: any) {
      setStatusError(error?.message ?? 'Health check failed');
      setHealth((current) => ({ ...current, status: 'unhealthy' }));
    }

    try {
      const stats = await apiClient.get('/v1/tasks/stats');
      setTaskStats(stats.data?.data ?? stats.data ?? null);
    } catch {
      setTaskStats(null);
    }
  };

useEffect(() => {
     let active = true;
     
     const load = async () => {
       if (active) await refreshStatus();
     };
     
     void load();
     const interval = setInterval(() => {
       if (active) void refreshStatus();
     }, 30000);
     return () => {
       active = false;
       clearInterval(interval);
     };
   }, []);

  useEffect(() => {
    if (!logsOpen) return;
    let active = true;

    const loadLogs = async () => {
      try {
        if (active) setLogsText('Loading system logs...');
        const res = await apiClient.get('/v1/logs/stats');
        if (!active) return;
        setLogsText(JSON.stringify(res.data?.data ?? res.data, null, 2));
      } catch {
        if (!active) return;
        setLogsText('Unable to fetch logs.');
      }
    };

    void loadLogs();

    return () => {
      active = false;
    };
  }, [logsOpen]);

useEffect(() => {
    if (!pathname && !searchParams) return;
    const progressRefSnapshot = progressRef.current;
    const { timer, interval } = progressRefSnapshot;
    if (timer) clearTimeout(timer);
    if (interval) clearInterval(interval);

    // Only show loading animation if status is not already healthy
    if (health.status !== 'healthy') {
      const startProgress = () => {
        let currentProgress = 15;
        let logIndex = 0;

        setNavLoading(true);
        setProgress(15);
        setLogText('Refreshing hub state...');

        const newInterval = setInterval(() => {
          currentProgress += Math.random() * 10;
          if (currentProgress > 92) currentProgress = 92;
          setProgress(currentProgress);
          logIndex += 1;
          if (logIndex < NAV_LOGS.length - 1) {
            setLogText(NAV_LOGS[logIndex]);
          }
        }, 160);

        const newTimer = setTimeout(() => {
          clearInterval(newInterval);
          setProgress(100);
          setLogText(NAV_LOGS[NAV_LOGS.length - 1]);

          setTimeout(() => {
            setNavLoading(false);
            setProgress(0);
            setLogText('System Normal');
          }, 300);
        }, 900 + Math.random() * 300);

        progressRefSnapshot.timer = newTimer;
        progressRefSnapshot.interval = newInterval;
      };

      startProgress();

      return () => {
        if (progressRefSnapshot.timer) clearTimeout(progressRefSnapshot.timer);
        if (progressRefSnapshot.interval) clearInterval(progressRefSnapshot.interval);
      };
    }
  }, [pathname, searchParams, health.status]);

  return (
    <div className={cn('h-10 bg-surface-dark border-t border-white/10 flex items-center justify-between px-4 text-xs font-mono text-gray-400 shrink-0 relative overflow-hidden', className)}>
      {navLoading ? (
        <div
          className='absolute top-0 left-0 h-full bg-nexus-blue/10 transition-all duration-200 ease-out z-0'
          style={{ width: `${progress}%` }}
        />
      ) : (
        <div className='absolute top-0 left-0 h-px bg-white/5 w-full z-10' />
      )}

      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none'></div>

      <div className='flex items-center gap-4 relative z-10 w-full justify-between'>
        <div className='flex items-center gap-3 min-w-[240px]'>
          <NxConnectionDot status={backendStatus} />
          <div className='min-w-0'>
            <div className='text-[11px] text-gray-200 font-semibold truncate'>
              {pageName} · {health.app}
            </div>
            <div className='text-[10px] text-gray-400 truncate'>
              {statusError ? `Health error: ${statusError}` : health.status === 'healthy' ? `All systems nominal · ${health.timestamp}` : `Backend ${health.status}`}
            </div>
          </div>
        </div>

        <div className='hidden sm:flex items-center gap-3 flex-1 justify-center'>
          <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1'>
            <NxConnectionDot status={backendStatus} />
            <span className='text-[10px] text-gray-400'>Backend</span>
          </div>
          <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1'>
            <NxConnectionDot status={reverbStatus} />
            <span className='text-[10px] text-gray-400'>Reverb</span>
          </div>
          <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1'>
            <NxConnectionDot status={queueStatus} />
            <span className='text-[10px] text-gray-400'>Queue</span>
          </div>
          <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1'>
            <NxConnectionDot status={authStatus} />
            <span className='text-[10px] text-gray-400'>Auth</span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setDetailsOpen(true)}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:bg-white/10 transition-colors'
          >
            Details
          </button>
          <button
            onClick={() => setLogsOpen(true)}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:bg-white/10 transition-colors'
          >
            Logs
          </button>
          <button
            onClick={() => setJobMonitorOpen(!isJobMonitorOpen)}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:bg-white/10 transition-colors'
          >
            Jobs
          </button>
          <button
            onClick={() => setNotificationDrawerOpen(!isNotificationDrawerOpen)}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-1.5'
          >
            <Bell className='w-3 h-3' /> Notifications
          </button>
        </div>
      </div>

      <NxModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title={<span>Status Details</span>} size='lg'>
        <div className='space-y-4 text-xs text-gray-300'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='rounded-2xl bg-black/70 p-4 border border-white/10'>
              <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-2'>Backend Health</div>
              <div className='text-sm font-semibold text-white capitalize'>{health.status}</div>
              <div className='mt-2 text-[11px] text-gray-400'>{health.app}</div>
              <div className='mt-1 text-[11px] text-gray-500'>{health.timestamp}</div>
            </div>
            <div className='rounded-2xl bg-black/70 p-4 border border-white/10'>
              <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-2'>Queue Metrics</div>
              <div className='text-sm font-semibold text-white'>{taskStats?.running ?? '—'} active</div>
              <div className='mt-2 text-[11px] text-gray-400'>{taskStats?.pending ?? '—'} queued</div>
              <div className='mt-1 text-[11px] text-gray-500'>{taskStats?.failed ?? '—'} failed</div>
            </div>
          </div>
          <div>
            <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-2'>Service Snapshot</div>
            <pre className='rounded-2xl bg-black/80 p-4 border border-white/10 overflow-x-auto text-[11px] text-gray-300'>{JSON.stringify({ health: health.details, taskStats }, null, 2)}</pre>
          </div>
        </div>
      </NxModal>

      <NxModal isOpen={logsOpen} onClose={() => setLogsOpen(false)} title={<span>System Log Statistics</span>} size='lg'>
        <div className='space-y-4 text-xs text-gray-300'>
          {!logsText ? (
            <div className='text-center py-8'>
              <div className='text-gray-400'>Loading system logs...</div>
            </div>
          ) : typeof logsText === 'string' && logsText.includes('Unable to fetch') ? (
            <div className='text-center py-8 text-red-400'>
              {logsText}
            </div>
          ) : (
            <>
              {(() => {
                try {
                  const data = typeof logsText === 'string' ? JSON.parse(logsText) : logsText;
                  return (
                    <>
                      {/* Total Logs Card */}
                      <div className='rounded-2xl bg-black/70 p-4 border border-white/10'>
                        <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-2'>Total Logs</div>
                        <div className='text-2xl font-bold text-nexus-blue'>{data.total || 0}</div>
                      </div>

                      {/* Today's Stats */}
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='rounded-2xl bg-black/70 p-4 border border-white/10'>
                          <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-2'>Today</div>
                          <div className='text-lg font-semibold text-white'>{data.today || 0}</div>
                          <div className='text-[11px] text-gray-400 mt-1'>log entries</div>
                        </div>
                        <div className='rounded-2xl bg-black/70 p-4 border border-red-500/20'>
                          <div className='text-[10px] text-red-400 uppercase tracking-[0.25em] mb-2'>Errors Today</div>
                          <div className='text-lg font-semibold text-red-400'>{data.errors_today || 0}</div>
                          <div className='text-[11px] text-red-300/60 mt-1'>critical</div>
                        </div>
                      </div>

                      {/* By Level */}
                      {data.by_level && Object.keys(data.by_level).length > 0 && (
                        <div className='rounded-2xl bg-black/70 p-4 border border-white/10'>
                          <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-3'>Logs by Level</div>
                          <div className='space-y-2'>
                            {Object.entries(data.by_level).map(([level, count]: any) => (
                              <div key={level} className='flex items-center justify-between'>
                                <span className='capitalize text-gray-400'>{level}</span>
                                <div className='flex items-center gap-2'>
                                  <div className='w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden'>
                                    <div
                                      className={`h-full ${level === 'error' || level === 'critical' ? 'bg-red-500' :
                                        level === 'warning' ? 'bg-yellow-500' :
                                          level === 'info' ? 'bg-blue-500' :
                                            'bg-green-500'
                                        }`}
                                      style={{ width: `${(count / (data.total || 1)) * 100}%` }}
                                    />
                                  </div>
                                  <span className='font-semibold text-gray-200 w-8 text-right'>{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* By Channel */}
                      {data.by_channel && Object.keys(data.by_channel).length > 0 && (
                        <div className='rounded-2xl bg-black/70 p-4 border border-white/10'>
                          <div className='text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-3'>Logs by Channel</div>
                          <div className='space-y-2'>
                            {Object.entries(data.by_channel).map(([channel, count]: any) => (
                              <div key={channel} className='flex items-center justify-between text-[11px]'>
                                <span className='text-gray-400'>{channel}</span>
                                <span className='font-semibold text-gray-200'>{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw JSON for debugging */}
                      <details className='rounded-2xl bg-black/70 p-4 border border-white/10'>
                        <summary className='text-[10px] text-gray-500 uppercase tracking-[0.25em] cursor-pointer hover:text-gray-300'>
                          Raw Data (JSON)
                        </summary>
                        <pre className='mt-3 text-[10px] overflow-x-auto text-gray-300'>{JSON.stringify(data, null, 2)}</pre>
                      </details>
                    </>
                  );
                } catch (e) {
                  return <pre className='text-xs font-mono whitespace-pre-wrap'>{logsText}</pre>;
                }
              })()}
            </>
          )}
        </div>
      </NxModal>

      <GlobalJobMonitor isOpen={isJobMonitorOpen} onClose={() => setJobMonitorOpen(false)} />
    </div>
  );
}

export const NxStatusBar = ({ className }: { className?: string }) => {
  return (
    <Suspense fallback={<div className='h-10 bg-surface-dark border-t border-white/10' />}>
      <StatusBarContent className={className} />
    </Suspense>
  );
};

