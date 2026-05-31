"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxInput } from '@/components/NxInput';
import { Clock, Play, Pause, Trash2, Plus, Calendar } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface SchedulerJob {
  id: number;
  name: string;
  type: string;
  cron_expression: string;
  payload: any;
  status: 'active' | 'paused' | 'failing';
  is_running: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
}

export default function SchedulerPage() {
  const [jobs, setJobs] = useState<SchedulerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<SchedulerJob>>({
    type: 'command',
    status: 'active',
    cron_expression: '* * * * *',
    payload: '{}'
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/scheduler');
      setJobs(res.data?.data || []);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      await fetchJobs();
    };
    void loadJobs();
  }, []);

  const handleToggleStatus = async (job: SchedulerJob) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    try {
      await apiClient.put(`/scheduler/${job.id}`, { status: newStatus });
      fetchJobs();
    } catch (e: any) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this scheduled job?')) return;
    try {
      await apiClient.delete(`/scheduler/${id}`);
      fetchJobs();
    } catch (e: any) {
      alert('Failed to delete');
    }
  };

  const handleSaveJob = async () => {
    try {
      let payloadObj = {};
      try {
        payloadObj = typeof editingJob.payload === 'string' ? JSON.parse(editingJob.payload || '{}') : editingJob.payload;
      } catch (err) {
        alert('Invalid JSON in payload');
        return;
      }
      
      const dataToSave = { ...editingJob, payload: payloadObj };
      
      if (editingJob.id) {
        await apiClient.put(`/scheduler/${editingJob.id}`, dataToSave);
      } else {
        await apiClient.post(`/scheduler`, dataToSave);
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (e: any) {
      alert('Failed to save job. Check cron expression and payload JSON.');
    }
  };

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Clock className="w-6 h-6 text-nexus-blue animate-pulse" />
              Task Scheduler
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage recurring tasks, webhook triggers, and cron expressions.
            </p>
          </div>
          <NxActionButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => {
            setEditingJob({ type: 'command', status: 'active', cron_expression: '0 0 * * *', payload: '{}' });
            setIsModalOpen(true);
          }}>
            New Job
          </NxActionButton>
        </div>
        
        {errorMsg && (
          <div className="bg-red-500/10 text-red-200 border border-red-500/20 p-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading scheduler configuration...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <NxGlassCard key={job.id} className="p-5 flex flex-col gap-4 border-white/10 relative overflow-hidden group">
                {job.is_running && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-blue to-hedral-purple animate-pulse" />
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{job.name}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500">{job.type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                    job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                    <Calendar className="w-3.5 h-3.5 text-nexus-blue" />
                    {job.cron_expression}
                  </div>
                  <div className="text-[10px] text-gray-500 flex flex-col gap-1 mt-2 font-mono">
                    <span>NEXT: {job.next_run_at ? new Date(job.next_run_at).toLocaleString() : 'Pending calculation'}</span>
                    <span>LAST: {job.last_run_at ? new Date(job.last_run_at).toLocaleString() : 'Never run'}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleToggleStatus(job)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title={job.status === 'active' ? 'Pause' : 'Resume'}>
                    {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => {
                     setEditingJob({ ...job, payload: JSON.stringify(job.payload, null, 2) });
                     setIsModalOpen(true);
                  }} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </NxGlassCard>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <NxGlassCard className="w-full max-w-lg p-6 flex flex-col gap-4 border-white/20 bg-surface-dark/95 shadow-2xl">
              <h2 className="text-xl font-semibold text-white">{editingJob.id ? 'Edit Job' : 'Create Job'}</h2>
              
              <div className="flex flex-col gap-4 mt-4">
                <NxInput 
                  placeholder="Job Name" 
                  value={editingJob.name || ''} 
                  onChange={(e) => setEditingJob({...editingJob, name: e.target.value})} 
                />
                
                <div className="flex gap-4">
                  <select 
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-nexus-blue"
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({...editingJob, type: e.target.value})}
                  >
                    <option value="command">Command</option>
                    <option value="job">Queue Job</option>
                    <option value="webhook">Webhook</option>
                    <option value="script">Script</option>
                  </select>
                  
                  <div className="flex-1">
                    <NxInput 
                      placeholder="Cron Expr (* * * * *)" 
                      value={editingJob.cron_expression || ''} 
                      onChange={(e) => setEditingJob({...editingJob, cron_expression: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-mono">Payload (JSON)</label>
                  <textarea 
                    value={typeof editingJob.payload === 'string' ? editingJob.payload : JSON.stringify(editingJob.payload || {}, null, 2)}
                    onChange={(e) => setEditingJob({...editingJob, payload: e.target.value})}
                    className="w-full min-h-[120px] rounded-lg border border-white/10 bg-black/40 px-3 py-3 text-xs font-mono text-gray-100 outline-none transition-colors focus:border-nexus-blue focus:ring-1 focus:ring-nexus-blue"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
                <NxActionButton variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</NxActionButton>
                <NxActionButton variant="primary" onClick={handleSaveJob}>Save Job</NxActionButton>
              </div>
            </NxGlassCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
