import React, { useEffect, useState } from 'react';

interface NxExecutionDebuggerProps {
  executionId: string;
}

export function NxExecutionDebugger({ executionId }: NxExecutionDebuggerProps) {
  const [execution, setExecution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExecution() {
      try {
        const response = await fetch(`/api/v1/workflows/executions/${executionId}`);
        const data = await response.json();
        setExecution(data.data);
      } catch (err) {
        console.error('Failed to fetch execution', err);
      } finally {
        setLoading(false);
      }
    }

    if (executionId) {
      fetchExecution();
      const interval = setInterval(fetchExecution, 5000);
      return () => clearInterval(interval);
    }
  }, [executionId]);

  if (loading) return <div className="text-neutral-400 p-4">Loading Execution state...</div>;
  if (!execution) return <div className="text-red-400 p-4">Execution not found.</div>;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Execution Debugger</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          execution.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          execution.status === 'failed' ? 'bg-red-500/20 text-red-400' :
          execution.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
          'bg-neutral-700 text-neutral-300'
        }`}>
          {execution.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
          <h4 className="text-xs text-neutral-500 mb-2 font-semibold">Input Payload</h4>
          <pre className="text-xs text-neutral-300 overflow-auto max-h-40">
            {JSON.stringify(execution.input_payload, null, 2) || '{}'}
          </pre>
        </div>
        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
          <h4 className="text-xs text-neutral-500 mb-2 font-semibold">Runtime State</h4>
          <pre className="text-xs text-neutral-300 overflow-auto max-h-40">
            {JSON.stringify(execution.runtime_state, null, 2) || '{}'}
          </pre>
        </div>
      </div>

      <div>
        <h4 className="text-xs text-neutral-500 mb-2 font-semibold">Step Logs</h4>
        <div className="space-y-2">
          {execution.step_logs?.map((log: any) => (
            <div key={log.id} className="flex flex-col gap-1 bg-neutral-950 p-2 rounded border border-neutral-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-200">{log.step_name || log.step_id}</span>
                <span className={`text-xs ${
                  log.status === 'completed' ? 'text-green-400' :
                  log.status === 'failed' ? 'text-red-400' : 'text-blue-400'
                }`}>{log.status} ({log.duration_ms}ms)</span>
              </div>
              {log.error && <div className="text-xs text-red-400">{log.error}</div>}
            </div>
          ))}
          {(!execution.step_logs || execution.step_logs.length === 0) && (
            <div className="text-xs text-neutral-500">No steps executed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
