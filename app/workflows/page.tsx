"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxWorkflowNode } from '@/components/NxWorkflowNode';
import { NxModal } from '@/components/NxModal';
import { NxInput } from '@/components/NxInput';
import { NxSelect } from '@/components/NxSelect';
import { NxActionButton } from '@/components/NxActionButton';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxApprovalGateModal } from '@/components/NxApprovalGateModal';
import apiClient from '@/lib/api/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import { CheckCircle2, GitMerge, PauseCircle, Play, Plus, RefreshCw, Radio, XCircle } from 'lucide-react';

type NodeType = 'trigger' | 'action' | 'condition' | 'agent';
type NodeStatus = 'pending' | 'running' | 'success' | 'error';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status?: NodeStatus;
}

interface WorkflowItem {
  id: string | number;
  name: string;
  key: string;
  description?: string;
  status: string;
  trigger_type: string;
  steps: WorkflowStep[];
  version: number;
  is_system: boolean;
}

interface WorkflowExecution {
  id: string;
  status: string;
  step_logs?: Array<{
    step_id: string;
    status: string;
    step_name: string;
    duration_ms?: number;
    error?: string;
  }>;
  runtime_state?: {
    waiting_for?: { type?: string; step_id?: string };
    variables?: Record<string, unknown>;
  };
}

interface ReverbStepEvent {
  execution_id?: string;
  step_id?: string;
  step_name?: string;
  status?: string;
  output?: Record<string, unknown>;
  duration_ms?: number;
  error?: string;
}

const starterSteps: WorkflowStep[] = [
  { id: 'manual_trigger', name: 'Manual Launch', type: 'trigger' },
  { id: 'collect_context', name: 'Collect Context', type: 'action' },
  { id: 'approval_gate', name: 'Human Approval', type: 'wait' },
  { id: 'final_log', name: 'Write Execution Log', type: 'log' },
];

const mapNodeType = (type: string): NodeType => {
  if (type === 'agent' || type === 'task') return 'agent';
  if (type === 'decision' || type === 'condition') return 'condition';
  if (type === 'trigger' || type === 'webhook' || type === 'scheduled') return 'trigger';
  return 'action';
};

const mapNodeStatus = (step: WorkflowStep, execution?: WorkflowExecution): NodeStatus => {
  const log = execution?.step_logs?.find(item => item.step_id === step.id);
  if (!log) return 'pending';
  if (log.status === 'running' || log.status === 'paused') return 'running';
  if (log.status === 'failed') return 'error';
  return 'success';
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('manual');
  const [realtimeLogs, setRealtimeLogs] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const { echo, connectionStatus } = useWebSocket();

  const selectedWorkflow = useMemo(
    () => workflows.find(workflow => workflow.id === selectedId) ?? workflows[0] ?? null,
    [workflows, selectedId]
  );

  const nodes = useMemo(() => {
    return (selectedWorkflow?.steps ?? []).map(step => ({
      ...step,
      status: mapNodeStatus(step, execution ?? undefined),
    }));
  }, [selectedWorkflow, execution]);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/v1/workflows?limit=50');
      const list = response.data?.data ?? [];
      setWorkflows(list);
      if (!selectedId && list.length > 0) setSelectedId(list[0].id);
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  const fetchProgress = useCallback(async (workflowId: string | number) => {
    const response = await apiClient.get(`/v1/workflows/${workflowId}/progress`);
    const latest = response.data?.data?.latest_execution;
    setExecution(latest ?? null);

    // Trigger approval modal if execution is paused waiting for approval
    if (latest?.status === 'paused' && latest?.runtime_state?.waiting_for?.type === 'approval') {
      setShowApprovalModal(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchWorkflows();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchWorkflows]);

  // Fetch progress on workflow select
  useEffect(() => {
    if (!selectedWorkflow) return;
    const timer = window.setTimeout(() => {
      void fetchProgress(selectedWorkflow.id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchProgress, selectedWorkflow]);

  // Polling fallback when WebSocket is not connected
  useEffect(() => {
    if (wsConnected) return; // Skip polling if WebSocket is live
    if (!execution || ['completed', 'failed', 'cancelled'].includes(execution.status)) return;

    const timer = window.setInterval(() => {
      if (selectedWorkflow) void fetchProgress(selectedWorkflow.id);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [execution, fetchProgress, selectedWorkflow, wsConnected]);

  // Reverb WebSocket subscription for workflow.{workflowId}
  useEffect(() => {
    if (!echo || connectionStatus !== 'connected' || !selectedWorkflow) return;

    const workflowId = selectedWorkflow.id;
    const channelName = `workflow.${workflowId}`;

    setWsConnected(true);

    const channel = echo.private(channelName);

    channel.listen('.workflow.started', (event: any) => {
      setRealtimeLogs(prev => [
        `â–¶ Workflow started â€” execution: ${event.execution_id ?? 'unknown'}`,
        ...prev,
      ]);
      // Refresh execution state
      void fetchProgress(workflowId);
    });

    channel.listen('.workflow.step_completed', (event: ReverbStepEvent) => {
      const statusIcon = event.status === 'failed' ? 'âœ—' : 'âœ“';
      const durationStr = event.duration_ms ? ` (${event.duration_ms}ms)` : '';
      setRealtimeLogs(prev => [
        `${statusIcon} ${event.step_name ?? event.step_id} â€” ${event.status}${durationStr}${event.error ? ` | Error: ${event.error}` : ''}`,
        ...prev,
      ]);

      // Patch the execution step logs optimistically
      setExecution(prev => {
        if (!prev) return prev;
        const existingLogs = prev.step_logs ?? [];
        const exists = existingLogs.find(l => l.step_id === event.step_id);
        const newLog = {
          step_id: event.step_id ?? '',
          step_name: event.step_name ?? '',
          status: event.status ?? 'completed',
          duration_ms: event.duration_ms,
          error: event.error,
        };
        const updatedLogs = exists
          ? existingLogs.map(l => (l.step_id === event.step_id ? newLog : l))
          : [...existingLogs, newLog];
        return { ...prev, step_logs: updatedLogs };
      });
    });

    channel.listen('.workflow.completed', (event: any) => {
      setRealtimeLogs(prev => [
        `âœ… Workflow completed successfully`,
        ...prev,
      ]);
      setExecution(prev => prev ? { ...prev, status: 'completed' } : prev);
      setWsConnected(false);
    });

    channel.listen('.workflow.failed', (event: any) => {
      setRealtimeLogs(prev => [
        `âŒ Workflow failed${event.error ? `: ${event.error}` : ''}`,
        ...prev,
      ]);
      setExecution(prev => prev ? { ...prev, status: 'failed' } : prev);
      setWsConnected(false);
    });

    // Approval gate pause event
    channel.listen('.workflow.step_completed', (event: ReverbStepEvent) => {
      if (event.status === 'paused') {
        void fetchProgress(workflowId);
        setShowApprovalModal(true);
      }
    });

    return () => {
      echo.leave(channelName);
      setWsConnected(false);
    };
  }, [echo, connectionStatus, selectedWorkflow, fetchProgress]);

  const createWorkflow = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;

    const key = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `workflow-${Date.now()}`;
    const response = await apiClient.post('/v1/workflows', {
      name: newName,
      key: `${key}-${Date.now()}`,
      description: 'Custom orchestration workflow',
      trigger_type: newTrigger,
      status: 'draft',
      steps: starterSteps,
      settings: { max_execution_depth: 1000 },
    });

    const workflow = response.data?.data;
    setWorkflows(current => [workflow, ...current]);
    setSelectedId(workflow.id);
    setNewName('');
    setNewTrigger('manual');
    setIsModalOpen(false);
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow || isRunning) return;
    setIsRunning(true);
    setRealtimeLogs([]);
    try {
      const response = await apiClient.post(`/v1/workflows/${selectedWorkflow.id}/execute`, {
        run_mode: 'async',
        input_payload: { launched_from: 'WorkflowsHub' },
      });
      setExecution(response.data?.data ?? null);
      void fetchProgress(selectedWorkflow.id);
    } finally {
      setIsRunning(false);
    }
  };

  const resumeExecution = async (decision: 'approve' | 'deny') => {
    if (!execution) return;
    const response = await apiClient.post(`/v1/workflows/executions/${execution.id}/resume`, {
      decision,
      input_payload: { approval_decision: decision },
    });
    setExecution(response.data?.data ?? null);
    setShowApprovalModal(false);
  };

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-nexus-blue" />
              Workflow Orchestration Canvas
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {selectedWorkflow ? `${selectedWorkflow.name} v${selectedWorkflow.version}` : 'No workflow selected'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* WebSocket status indicator */}
            <div
              title={connectionStatus === 'connected' ? 'Live via WebSocket' : `WebSocket: ${connectionStatus}`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono border ${
                connectionStatus === 'connected'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-gray-700 bg-gray-900 text-gray-500'
              }`}
            >
              <Radio className={`w-3 h-3 ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
              {connectionStatus === 'connected' ? 'Live' : 'Offline'}
            </div>
            <NxActionButton variant="secondary" size="sm" onClick={fetchWorkflows} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </NxActionButton>
            <NxActionButton variant="secondary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              New Workflow
            </NxActionButton>
            <NxActionButton
              variant="primary"
              size="sm"
              onClick={executeWorkflow}
              leftIcon={<Play className="w-4 h-4 text-white hover:text-white" />}
              isLoading={isRunning}
              disabled={!selectedWorkflow || selectedWorkflow.status === 'running'}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Execute
            </NxActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] gap-4 min-h-[520px]">
          {/* Workflow list sidebar */}
          <NxGlassCard className="p-3 bg-white/5 border-white/5 overflow-hidden">
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {workflows.map(workflow => (
                <button
                  key={workflow.id}
                  onClick={() => {
                    setSelectedId(workflow.id);
                    setExecution(null);
                    setRealtimeLogs([]);
                  }}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    workflow.id === selectedWorkflow?.id
                      ? 'border-nexus-blue/60 bg-nexus-blue/10'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-100 truncate">{workflow.name}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{workflow.trigger_type} / {workflow.status}</div>
                </button>
              ))}

              {!isLoading && workflows.length === 0 && (
                <NxEmptyState
                  title="No Workflows"
                  description="Create a workflow to begin orchestration."
                  icon={<GitMerge className="w-8 h-8 text-gray-500" />}
                />
              )}
            </div>
          </NxGlassCard>

          {/* Canvas */}
          <div className="bg-black/40 border border-white/10 rounded-lg relative overflow-x-auto overflow-y-hidden p-6 select-none bg-grid">
            {nodes.length > 0 ? (
              <div className="relative w-max min-w-full h-full flex items-center">
                <div className="flex gap-16 pr-12 relative z-10 py-24">
                  {nodes.map((node, index) => (
                    <div key={node.id} className="relative">
                      <NxWorkflowNode
                        title={node.name}
                        type={mapNodeType(node.type)}
                        status={node.status}
                        selected={node.status === 'running'}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-gray-500 uppercase">
                        {node.type}
                      </div>
                      {index < nodes.length - 1 && (
                        <div className="hidden md:block absolute left-[190px] top-1/2 w-16 h-px bg-nexus-blue/40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <NxEmptyState
                  title="Canvas is Empty"
                  description="This workflow has no registered steps."
                  icon={<GitMerge className="w-8 h-8 text-gray-500" />}
                />
              </div>
            )}
          </div>

          {/* Execution Tracer */}
          <NxGlassCard className="p-4 bg-white/5 border-white/5 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <span className="text-sm font-semibold text-gray-100">Execution Tracer</span>
              <div className="flex items-center gap-1.5">
                {execution?.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-success" />}
                {execution?.status === 'failed' && <XCircle className="w-4 h-4 text-error" />}
                {execution?.status === 'paused' && <PauseCircle className="w-4 h-4 text-amber-400" />}
              </div>
            </div>

            <div className="mt-3 text-xs font-mono text-gray-400 space-y-2 max-h-[300px] overflow-y-auto flex-1">
              {/* Real-time Reverb log lines */}
              {realtimeLogs.length > 0 && (
                <div className="space-y-1 mb-3">
                  {realtimeLogs.map((line, idx) => (
                    <div
                      key={idx}
                      className={`text-[11px] leading-relaxed ${
                        line.startsWith('âŒ') || line.startsWith('âœ—')
                          ? 'text-red-400'
                          : line.startsWith('âœ…') || line.startsWith('âœ“')
                          ? 'text-emerald-400'
                          : line.startsWith('â–¶')
                          ? 'text-blue-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-2 mt-2 text-gray-600 text-[10px]">â”€â”€ API step logs â”€â”€</div>
                </div>
              )}

              {execution ? (
                <>
                  <div>execution: {execution.id}</div>
                  <div>status: <span className={`${
                    execution.status === 'completed' ? 'text-emerald-400' :
                    execution.status === 'failed' ? 'text-red-400' :
                    execution.status === 'paused' ? 'text-amber-400' :
                    execution.status === 'running' ? 'text-blue-400' : 'text-gray-400'
                  }`}>{execution.status}</span></div>
                  {(execution.step_logs ?? []).map(log => (
                    <div key={`${log.step_id}-${log.status}`} className="rounded border border-white/10 bg-black/30 p-2">
                      <div className="text-gray-200">{log.step_name}</div>
                      <div className={`${log.status === 'failed' ? 'text-red-400' : log.status === 'completed' ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {log.status}{log.duration_ms ? ` / ${log.duration_ms}ms` : ''}
                      </div>
                      {log.error && <div className="text-error">{log.error}</div>}
                    </div>
                  ))}
                </>
              ) : (
                <div>No active execution.</div>
              )}
            </div>

            {/* Inline approval buttons when paused (quick-action) */}
            {execution?.status === 'paused' && execution.runtime_state?.waiting_for?.type === 'approval' && (
              <div className="flex gap-2 mt-4 border-t border-white/10 pt-4 shrink-0">
                <NxActionButton size="sm" variant="primary" onClick={() => setShowApprovalModal(true)}>
                  Review Approval Gate
                </NxActionButton>
              </div>
            )}
          </NxGlassCard>
        </div>

        {/* Create Workflow Modal */}
        <NxModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Workflow">
          <form onSubmit={createWorkflow} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Name</label>
              <NxInput value={newName} onChange={event => setNewName(event.target.value)} placeholder="Daily approval workflow" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Trigger</label>
              <NxSelect value={newTrigger} onChange={event => setNewTrigger(event.target.value)}>
                <option value="manual">Manual</option>
                <option value="scheduled">Scheduled</option>
                <option value="event">Event</option>
                <option value="webhook">Webhook</option>
              </NxSelect>
            </div>
            <div className="flex md:justify-end gap-3 mt-4 border-t border-white/5 pt-4">
              <NxActionButton type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </NxActionButton>
              <NxActionButton type="submit" variant="primary" size="sm">
                Create
              </NxActionButton>
            </div>
          </form>
        </NxModal>

        {/* Approval Gate Modal */}
        {showApprovalModal && execution && (
          <NxApprovalGateModal
            executionId={execution.id}
            stepId={execution.runtime_state?.waiting_for?.step_id}
            contextData={execution.runtime_state as any}
            onApprove={() => void resumeExecution('approve')}
            onReject={() => void resumeExecution('deny')}
            onClose={() => setShowApprovalModal(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}
