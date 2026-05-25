"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store/store-provider';
import { Cpu, RotateCw, CheckCircle, XCircle, Play, Pause, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NxActionButton } from './NxActionButton';

export const GlobalJobMonitor = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const jobs = useAppStore((state) => (state as any).jobs || []);
  const cancelJob = useAppStore((state) => (state as any).cancelJob);
  const clearCompletedJobs = useAppStore((state) => (state as any).clearCompletedJobs);

  const activeJobs = jobs.filter((j: any) => j.status === 'running');
  const completedJobs = jobs.filter((j: any) => j.status === 'success' || j.status === 'failed');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen split */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="fixed right-4 top-18 bottom-4 w-96 bg-surface-dark border border-white/10 glass rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Cpu className={cn("w-4 h-4 text-nexus-blue", activeJobs.length > 0 && "animate-spin")} />
                <span className="font-semibold text-gray-100 font-mono text-sm uppercase tracking-wider">Global Job Pipeline</span>
                {activeJobs.length > 0 && (
                  <span className="bg-nexus-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeJobs.length} Run
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-500 font-mono">
                  No background jobs in telemetry stream
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => {
                    const statusColors = {
                      running: "text-nexus-blue",
                      success: "text-success",
                      failed: "text-error"
                    };

                    return (
                      <div 
                        key={job.id}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 hover:border-white/15 transition-all text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-gray-200">{job.name}</span>
                            <div className="text-[10px] text-gray-500 font-mono">ID: {job.id}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {job.status === 'running' ? (
                              <RotateCw className="w-3.5 h-3.5 text-nexus-blue animate-spin" />
                            ) : job.status === 'success' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-error" />
                            )}
                            
                            {job.status === 'running' && (
                              <button 
                                onClick={() => cancelJob?.(job.id)}
                                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                                title="Abrupt abort task"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className={cn("h-full", 
                                job.status === 'running' ? 'bg-nexus-blue' : 
                                job.status === 'success' ? 'bg-success' : 'bg-error'
                              )}
                              animate={{ width: `${job.progress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span>Status: {job.status.toUpperCase()}</span>
                            <span className="font-bold text-gray-300">{job.progress}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {completedJobs.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-black/20 flex justify-end">
                <NxActionButton 
                  variant="ghost" 
                  size="sm"
                  onClick={clearCompletedJobs}
                  className="text-xs text-gray-400 hover:text-white"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Clear Closed Goals
                </NxActionButton>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
