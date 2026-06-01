"use client";

import React, { useState } from 'react';
import { NxGlassCard } from './NxGlassCard';
import { NxActionButton } from './NxActionButton';
import { ShieldAlert, X, Loader2, Database, Trash2, GitMerge } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/error-handler';

interface NxMemoryMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
}

export const NxMemoryMaintenanceModal: React.FC<NxMemoryMaintenanceModalProps> = ({ isOpen, onClose, contactId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [operation, setOperation] = useState('prune_stale');
  const [isDryRun, setIsDryRun] = useState(true);
  const [results, setResults] = useState<any>(null);

  const handleRunMaintenance = async () => {
    setIsSubmitting(true);
    setError('');
    setResults(null);

    try {
      const response = await apiClient.post(`/v1/contacts/${contactId}/memory-maintenance`, {
        operation,
        dry_run: isDryRun,
      });

      setResults((response.data as { data?: { results?: any } }).data?.results ?? null);
      setSuccess(true);

    } catch (err: any) {
      logError('Failed to run memory maintenance', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to run maintenance.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <NxGlassCard className="max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-200 p-0 border border-error/20">
        
        {/* Header Background */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-error/10 to-transparent pointer-events-none" />

        <div className="p-6 relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center border border-error/30">
              <Database className="w-5 h-5 text-error" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                Memory Maintenance
              </h2>
              <p className="text-xs text-error font-mono">Administrative Controls</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-gray-300">
              Select an administrative operation to run against this contact's relationship database.
            </p>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-white/5 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                <input type="radio" checked={operation === 'prune_stale'} onChange={() => setOperation('prune_stale')} className="mt-1 bg-transparent border-nexus-blue text-nexus-blue" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200">Prune Stale Memories</span>
                  <span className="text-[10px] text-gray-500">Deletes memories older than 1 year that haven't been validated recently.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-white/5 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                <input type="radio" checked={operation === 'resolve_duplicates'} onChange={() => setOperation('resolve_duplicates')} className="mt-1 bg-transparent border-nexus-blue text-nexus-blue" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200">Resolve Identity Conflicts</span>
                  <span className="text-[10px] text-gray-500">Attempts to merge duplicate identifiers and memories automatically.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-error/20 cursor-pointer bg-error/5 hover:bg-error/10 transition-colors">
                <input type="radio" checked={operation === 'erase_data'} onChange={() => setOperation('erase_data')} className="mt-1 bg-transparent border-error text-error" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-error">Erase Interaction Data</span>
                  <span className="text-[10px] text-error/70">Permanently purges all messages, memories, and logs (leaves base profile intact).</span>
                </div>
              </label>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input type="checkbox" checked={isDryRun} onChange={(e) => setIsDryRun(e.target.checked)} className="rounded border-gray-600 bg-transparent text-nexus-blue focus:ring-nexus-blue" />
              <span className="text-sm text-nexus-blue font-mono">Dry Run (Simulate only, no DB changes)</span>
            </label>

            {error && (
              <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex gap-2 items-start text-error">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs">{error}</p>
              </div>
            )}
            
            {success && results && (
              <div className="bg-nexus-blue/10 border border-nexus-blue/20 p-4 rounded-lg flex flex-col gap-2 text-nexus-blue">
                <h4 className="text-sm font-bold">Operation Completed {results.dry_run ? '(Dry Run)' : ''}</h4>
                <ul className="text-xs font-mono space-y-1">
                  <li>Items Processed: {results.items_processed}</li>
                  <li>Items Modified: {results.items_modified}</li>
                  <li>Items Deleted: {results.items_deleted}</li>
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <NxActionButton variant="ghost" onClick={onClose} disabled={isSubmitting}>
                {success ? 'Close' : 'Cancel'}
              </NxActionButton>
              <NxActionButton 
                variant="primary" 
                onClick={handleRunMaintenance} 
                disabled={isSubmitting}
                className={operation === 'erase_data' && !isDryRun ? 'bg-error border-error text-white hover:bg-error/80' : ''}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <>{operation === 'erase_data' ? <Trash2 className="w-4 h-4" /> : <GitMerge className="w-4 h-4" />} Execute</>
                )}
              </NxActionButton>
            </div>
          </div>
        </div>
      </NxGlassCard>
    </div>
  );
};
