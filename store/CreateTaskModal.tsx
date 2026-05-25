"use client";

import React, { useState } from 'react';
import { useGlobalStore } from '@/store';
import { 
  X, 
  Plus, 
  Loader2,
  Calendar,
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const createTask = useGlobalStore((state) => state.createTask);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // The store handles optimistic insertion and API error notification
      await createTask({
        title: formData.title,
        description: formData.description,
        status: 'todo',
        priority: formData.priority,
        dueDate: formData.dueDate,
      });
      
      // Clear form and close on successful dispatch
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      onClose();
    } catch (error) {
      // Error notification is triggered globally by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-[#0D1117]/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-inner shadow-blue-500/10">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Initialize Objective</h2>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-0.5 opacity-70">
                Nexus Task Orchestration
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-blue-400/80 ml-1">
                Objective Title
              </label>
              <input 
                type="text"
                required
                autoFocus
                placeholder="e.g., Deploy Neural Partition"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Contextual Details
              </label>
              <textarea 
                placeholder="Operational parameters and requirements..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                  Priority
                </label>
                <div className="relative">
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-[#161B22] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="low">Low Impact</option>
                    <option value="medium">Standard</option>
                    <option value="high">Critical</option>
                  </select>
                  <Layers className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                  ETA / Due
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g., T-Minus 2h"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono"
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold transition-all uppercase tracking-widest text-xs"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className={cn(
                "flex-[2] px-4 py-3.5 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-xs shadow-xl",
                formData.title.trim() 
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-[0.97]" 
                  : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Initialize Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
