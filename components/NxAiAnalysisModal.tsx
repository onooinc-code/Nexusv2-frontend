"use client";

import React, { useState } from 'react';
import { NxGlassCard } from './NxGlassCard';
import { NxActionButton } from './NxActionButton';
import { Brain, X, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { logError } from '@/lib/utils/error-handler';

interface NxAiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
}

export const NxAiAnalysisModal: React.FC<NxAiAnalysisModalProps> = ({ isOpen, onClose, contactId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    extract_topics: true,
    infer_persona: true,
    detect_emotion: true,
    suggest_rules: true,
  });

  const handleStartAnalysis = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.post(`/v1/contacts/${contactId}/analysis-runs`, {
        options,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      logError('Failed to start analysis run', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to start analysis run.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <NxGlassCard className="max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-200 p-0 border border-nexus-blue/20">
        
        {/* Header Background */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-nexus-blue/20 to-transparent pointer-events-none" />

        <div className="p-6 relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-nexus-blue/10 flex items-center justify-center border border-nexus-blue/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <Brain className="w-5 h-5 text-nexus-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                Deep Analysis
                <Sparkles className="w-4 h-4 text-nexus-blue animate-pulse" />
              </h2>
              <p className="text-xs text-nexus-blue font-mono">Powered by AgentsHub</p>
            </div>
          </div>

          {!success ? (
            <div className="space-y-6">
              <p className="text-sm text-gray-300">
                Nexus AI will scan recent messages in this conversation to build a comprehensive intelligence profile. Select the modules to run:
              </p>

              <div className="space-y-3 bg-black/20 rounded-xl p-4 border border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={options.extract_topics} onChange={(e) => setOptions({...options, extract_topics: e.target.checked})} className="peer sr-only" />
                    <div className="w-5 h-5 border border-white/20 rounded bg-white/5 peer-checked:bg-nexus-blue peer-checked:border-nexus-blue transition-colors"></div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Topic Extraction</span>
                    <span className="text-[10px] text-gray-500">Identifies frequently discussed subjects</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={options.infer_persona} onChange={(e) => setOptions({...options, infer_persona: e.target.checked})} className="peer sr-only" />
                    <div className="w-5 h-5 border border-white/20 rounded bg-white/5 peer-checked:bg-nexus-blue peer-checked:border-nexus-blue transition-colors"></div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Persona Inference</span>
                    <span className="text-[10px] text-gray-500">Determines communication style and background</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={options.detect_emotion} onChange={(e) => setOptions({...options, detect_emotion: e.target.checked})} className="peer sr-only" />
                    <div className="w-5 h-5 border border-white/20 rounded bg-white/5 peer-checked:bg-nexus-blue peer-checked:border-nexus-blue transition-colors"></div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Emotional Baseline</span>
                    <span className="text-[10px] text-gray-500">Calculates general sentiment and tone</span>
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex gap-2 items-start text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <NxActionButton variant="ghost" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </NxActionButton>
                <NxActionButton variant="primary" onClick={handleStartAnalysis} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Run Analysis</>
                  )}
                </NxActionButton>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-nexus-blue/20 rounded-full flex items-center justify-center text-nexus-blue mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Analysis Queued!</h3>
              <p className="text-sm text-gray-400 max-w-[250px]">
                Nexus AI is processing the messages in the background. The profile will update automatically when finished.
              </p>
            </div>
          )}
        </div>
      </NxGlassCard>
    </div>
  );
};
