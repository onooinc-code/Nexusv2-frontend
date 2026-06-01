"use client";

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/store/store-provider';
import { NxActionButton } from '@/components/NxActionButton';
import { NxGlassCard } from '@/components/NxGlassCard';
import {
  Activity, AlertTriangle, Brain, Database, Upload,
  Users, Mail, MessageCircle, MessageSquare, CheckCircle2,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/error-handler';

type ReplyMode = 'manual' | 'copilot' | 'autopilot';

interface ContactHubStats {
  total_contacts: number;
  active_contacts: number;
  new_imported_messages: number;
  pending_analysis_runs: number;
  stale_memory_count: number;
  identity_conflict_count: number;
  autopilot_enabled_count: number;
  failed_imports: number;
  failed_analysis_runs: number;
}

interface ContactHubTopbarControlsProps {
  /** Called when the user clicks "Maintain" — opens global maintenance flow */
  onMaintenanceClick?: () => void;
  /** Called when the user clicks "Import" — opens import modal */
  onImportClick?: () => void;
  /** Called when the user clicks "Analyze" — triggers batch analysis for all contacts */
  onBatchAnalyzeClick?: () => void;
}

export const ContactHubTopbarControls: React.FC<ContactHubTopbarControlsProps> = ({
  onMaintenanceClick,
  onImportClick,
  onBatchAnalyzeClick,
}) => {
  const addNotification = useAppStore((state) => state.addNotification);
  const [globalReplyMode, setGlobalReplyMode] = useState<ReplyMode>('manual');
  const [stats, setStats] = useState<ContactHubStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);

  const loadContactHubControls = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const [statsResponse, modeResponse] = await Promise.all([
        apiClient.get('/v1/contacts/stats'),
        apiClient.get('/v1/contacts/reply-mode'),
      ]);

      const nextStats = (statsResponse.data as { data?: ContactHubStats }).data;
      const nextMode = (modeResponse.data as { data?: { mode?: ReplyMode } }).data?.mode;

      if (nextStats) setStats(nextStats);
      if (nextMode) setGlobalReplyMode(nextMode);
    } catch (error) {
      logError('Failed to load ContactHub controls', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    loadContactHubControls();
  }, [loadContactHubControls]);

  const handleGlobalReplyModeChange = async (mode: ReplyMode) => {
    try {
      await apiClient.patch('/v1/contacts/reply-mode', { mode });
      setGlobalReplyMode(mode);
      addNotification('success', `Global reply mode set to ${mode}`);
    } catch (error) {
      logError('Failed to update global reply mode', error);
      addNotification('error', 'Failed to update reply mode');
    }
  };

  const handleBatchAnalyze = async () => {
    if (onBatchAnalyzeClick) {
      onBatchAnalyzeClick();
      return;
    }

    setIsBatchAnalyzing(true);
    try {
      // Fetch all active contact IDs and dispatch a batch analysis run
      const contactsResp = await apiClient.get<{ data: { data: { id: number }[] } }>('/v1/contacts', {
        params: { is_active: true, per_page: 100 },
      });
      const contactIds: number[] = (contactsResp.data?.data?.data ?? []).map((c: { id: number }) => c.id);

      if (contactIds.length === 0) {
        addNotification('info', 'No active contacts found to analyze.');
        return;
      }

      await apiClient.post('/v1/contacts/analysis-runs/batch', {
        contact_ids: contactIds,
        options: { extract_topics: true, infer_persona: true, detect_emotion: true, suggest_rules: true },
      });

      addNotification(
        'success',
        `Batch analysis queued for ${contactIds.length} contacts. Results will appear in each contact's AI Analysis tab.`
      );
      // Refresh stats to reflect new queued runs
      loadContactHubControls();
    } catch (err) {
      logError('Batch analysis failed', err);
      addNotification('error', 'Failed to start batch analysis. Please try again.');
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  const pendingRuns = stats?.pending_analysis_runs ?? 0;
  const failures = (stats?.failed_imports ?? 0) + (stats?.failed_analysis_runs ?? 0);

  const statItems = [
    { label: 'Contacts',    value: stats?.total_contacts ?? 0,          Icon: Users },
    { label: 'Active',      value: stats?.active_contacts ?? 0,          Icon: CheckCircle2 },
    { label: 'New Msg',     value: stats?.new_imported_messages ?? 0,    Icon: MessageCircle },
    { label: 'AI Queue',    value: pendingRuns,                          Icon: Brain },
    { label: 'Stale Mem',   value: stats?.stale_memory_count ?? 0,       Icon: MessageSquare },
    { label: 'Conflicts',   value: stats?.identity_conflict_count ?? 0,  Icon: AlertTriangle },
    { label: 'Autopilot',   value: stats?.autopilot_enabled_count ?? 0,  Icon: Activity },
    { label: 'Failures',    value: failures,                              Icon: AlertTriangle },
  ];

  if (isLoadingStats && !stats) {
    return (
      <NxGlassCard className="p-4">
        <div className="text-center text-gray-400 text-sm">Loading ContactHub controls...</div>
      </NxGlassCard>
    );
  }

  return (
    <NxGlassCard className="p-4 flex flex-col gap-4">
      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {statItems.map(({ label, value, Icon }) => (
          <div key={label} className="text-center">
            <div className="flex justify-center mb-1 opacity-40">
              <Icon className="w-3 h-3 text-nexus-blue" />
            </div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-0.5 text-lg font-semibold text-gray-100">{value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Global Reply Mode Control */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <div className="text-xs uppercase tracking-wide text-gray-500">Global Reply Mode</div>
            {globalReplyMode === 'autopilot' && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-black/20 p-1 border border-white/5">
            {(['manual', 'copilot', 'autopilot'] as ReplyMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleGlobalReplyModeChange(mode)}
                className={`h-7 rounded-md text-xs font-medium capitalize transition-colors ${
                  globalReplyMode === mode
                    ? mode === 'autopilot'
                      ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30'
                      : 'bg-nexus-blue/20 text-blue-100 border border-nexus-blue/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <NxActionButton
            variant="secondary"
            size="sm"
            leftIcon={<Database className="w-3.5 h-3.5" />}
            onClick={onMaintenanceClick ?? (() => addNotification('info', 'Open a contact to run memory maintenance.'))}
          >
            Maintain
          </NxActionButton>

          <NxActionButton
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={onImportClick ?? (() => addNotification('info', 'Use the Import button on the contacts list to import messages.'))}
          >
            Import
          </NxActionButton>

          <NxActionButton
            variant="primary"
            size="sm"
            leftIcon={
              isBatchAnalyzing
                ? <Activity className="w-3.5 h-3.5 animate-spin" />
                : <Brain className="w-3.5 h-3.5" />
            }
            onClick={handleBatchAnalyze}
            disabled={isBatchAnalyzing}
          >
            {isBatchAnalyzing ? 'Queuing...' : 'Analyze All'}
          </NxActionButton>
        </div>

        {/* Queue Status Indicator — driven by real stats */}
        {pendingRuns > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nexus-blue/10 border border-nexus-blue/20 text-nexus-blue text-xs font-mono">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            {pendingRuns} analysis run{pendingRuns !== 1 ? 's' : ''} in queue
          </div>
        )}
      </div>
    </NxGlassCard>
  );
};