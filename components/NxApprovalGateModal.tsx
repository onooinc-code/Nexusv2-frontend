'use client';

import React, { useState } from 'react';
import { CheckCircle, ShieldAlert, X } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface ApprovalContext {
  step_id?: string;
  step_name?: string;
  waiting_for?: Record<string, unknown>;
  variables?: Record<string, unknown>;
}

interface NxApprovalGateModalProps {
  executionId: string;
  stepId?: string;
  contextData?: ApprovalContext;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function NxApprovalGateModal({
  executionId,
  stepId,
  contextData,
  onApprove,
  onReject,
  onClose,
}: NxApprovalGateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (decision: 'approve' | 'deny') => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/v1/workflows/executions/${executionId}/resume`, {
        decision,
        input_payload: {
          approval_decision: decision,
          step_id: stepId,
        },
      });
      decision === 'approve' ? onApprove() : onReject();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit approval decision:', err);
      setError(err?.message || 'Failed to submit decision. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-gate-title"
    >
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-neutral-900/95 via-neutral-900/90 to-amber-950/20 shadow-2xl shadow-amber-500/10 overflow-hidden"
        style={{
          animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Header glow strip */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close approval modal"
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-200 transition-colors rounded-full p-1 hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 rounded-full bg-amber-500/15 p-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 id="approval-gate-title" className="text-base font-semibold text-white leading-tight">
                Human Approval Required
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Workflow is paused at an approval gate. Your decision is required to continue execution.
              </p>
              {stepId && (
                <p className="text-[11px] text-amber-500/70 mt-1 font-mono">
                  Step: {contextData?.step_name || stepId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Context data */}
        {contextData && (
          <div className="px-6 py-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Execution Context
            </h4>
            <div className="text-xs text-neutral-300 overflow-auto max-h-48 bg-black/40 p-3 rounded-lg border border-white/5 font-mono">
              {JSON.stringify(contextData, null, 2)}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mx-6 mb-2 px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-white/5">
          <button
            onClick={() => handleAction('deny')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <X className="w-4 h-4 text-red-400" />
            )}
            Deny
          </button>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 rounded-lg shadow-lg shadow-emerald-500/20 border border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve & Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
