"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { NxGlassCard } from './NxGlassCard';
import { NxActionButton } from './NxActionButton';
import { Clock, History, Key, EyeOff, FileJson, Loader2, AlertCircle, RefreshCw, Download } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface AuditEvent {
  id: number;
  action: string;
  actor?: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

interface NxAuditViewerProps {
  contactId: number;
  contactName: string;
}

export const NxAuditViewer: React.FC<NxAuditViewerProps> = ({ contactId, contactName }) => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/v1/contacts/${contactId}/audit`, {
        params: { per_page: 50 },
      });
      const data = (response.data as { data?: { data?: AuditEvent[] } }).data?.data
        ?? (response.data as { data?: AuditEvent[] }).data
        ?? [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load audit log.');
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Call the real server-side export endpoint which assembles the full bundle
      const response = await apiClient.post<Blob>(
        `/v1/contacts/${contactId}/export`,
        {},
        { responseType: 'blob' }
      );

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus_export_${contactName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      // Fallback: download whatever JSON we have from the server
      const message = err?.response?.data?.message || 'Export failed. Please try again.';
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Tools */}
      <NxGlassCard className="p-6 border-nexus-blue/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-nexus-blue" />
            Privacy &amp; Data Portability
          </h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Nexus adheres to strict data portability standards. Download a complete JSON bundle of all
          data associated with this contact, including messages, memories, analysis findings, and audit logs.
        </p>
        <div className="flex items-center gap-4">
          <NxActionButton variant="secondary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><FileJson className="w-4 h-4" /> Export JSON Bundle</>
            )}
          </NxActionButton>
        </div>
      </NxGlassCard>

      {/* Audit Logs */}
      <NxGlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <History className="w-5 h-5 text-nexus-blue" />
            Version History &amp; Audit Log
          </h3>
          <button
            onClick={fetchAuditLogs}
            className="p-1.5 text-gray-500 hover:text-nexus-blue rounded-lg hover:bg-white/5 transition-colors"
            title="Refresh audit log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-nexus-blue" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-error/60" />
            <p className="text-sm text-error/80">{error}</p>
            <button onClick={fetchAuditLogs} className="text-xs text-nexus-blue hover:underline">
              Try again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <History className="w-10 h-10 text-gray-600" />
            <p className="text-sm text-gray-500">No audit events recorded yet.</p>
          </div>
        ) : (
          <div className="relative pl-4 border-l border-white/10 space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-black border-2 border-nexus-blue" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-200">{log.action}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    {log.actor && (
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3" /> {log.actor}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </NxGlassCard>
    </div>
  );
};
