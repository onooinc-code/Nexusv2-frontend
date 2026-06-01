import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import { useWebSocket } from '@/hooks/useWebSocket';

interface NxTaskExecutionLogProps {
  taskId: string;
}

export const NxTaskExecutionLog: React.FC<NxTaskExecutionLogProps> = ({ taskId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { echo, connectionStatus } = useWebSocket();

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    apiClient
      .get(`/v1/tasks/${taskId}/logs`)
      .then((res) => {
        // Support API envelopes return structure
        setLogs(res.data?.logs || res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch task logs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [taskId]);

  useEffect(() => {
    if (!echo || connectionStatus !== 'connected' || !taskId) return;

    const channelName = `task.${taskId}`;
    const channel = echo.private(channelName);

    channel.listen('.task.status_changed', (event: any) => {
      const newLog = {
        id: Date.now() + Math.random(),
        time: new Date().toISOString(),
        message: `Task status changed: ${event.oldStatus} -> ${event.newStatus}`,
        level: event.newStatus === 'failed' ? 'error' : 'info',
      };
      setLogs((prev) => [...prev, newLog]);
    });

    channel.listen('.AgentStarted', (event: any) => {
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          time: new Date().toISOString(),
          message: `Agent started execution: ${event.agent_name || 'Agent'}`,
          level: 'info',
        },
      ]);
    });

    channel.listen('.AgentCompleted', (event: any) => {
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          time: new Date().toISOString(),
          message: `Agent completed execution successfully.`,
          level: 'info',
        },
      ]);
    });

    channel.listen('.AgentFailed', (event: any) => {
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          time: new Date().toISOString(),
          message: `Agent execution failed: ${event.error}`,
          level: 'error',
        },
      ]);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [echo, connectionStatus, taskId]);

  return (
    <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-md overflow-y-auto max-h-64 mt-4 shadow-inner border border-gray-700 animate-fade-in">
      <div className="mb-2 text-xs text-gray-500 border-b border-gray-700 pb-1">EXECUTION LOG - TASK: {taskId}</div>
      {loading && logs.length === 0 ? (
        <div className="text-gray-500 py-1">Loading execution history...</div>
      ) : logs.length === 0 ? (
        <div className="text-gray-500 py-1">No logs available for this task.</div>
      ) : (
        logs.map((log, idx) => (
          <div key={log.id || idx} className="py-1">
            <span className="text-gray-500">[{log.time || log.created_at ? new Date(log.time || log.created_at).toLocaleTimeString() : ''}]</span>
            <span className={`ml-2 ${log.level === 'error' || log.status === 'failed' || log.level === 'failed' ? 'text-red-400' : (log.level === 'warning' ? 'text-yellow-400' : 'text-green-400')}`}>
              {log.message || log.log_message || log.content || JSON.stringify(log)}
            </span>
          </div>
        ))
      )}
      {!loading && (
        <div className="animate-pulse py-1 mt-2 flex items-center">
          <span className="w-2 h-4 bg-green-400 inline-block animate-blink"></span>
        </div>
      )}
    </div>
  );
};
