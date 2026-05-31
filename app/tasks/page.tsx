"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxDrawer } from '@/components/NxDrawer';
import { NxInput } from '@/components/NxInput';
import { NxSelect } from '@/components/NxSelect';
import { useAppStore } from '@/store/store-provider';
import { CheckSquare, ListTodo, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function TasksPage() {
  const tasks = useAppStore((state) => state.tasks);
  const hydrateTasks = useAppStore((state) => state.hydrateTasks);
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const addJob = useAppStore((state) => (state as any).addJob);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState("TBD");

  useEffect(() => {
    const loadTasks = async () => {
      await hydrateTasks();
    };
    void loadTasks();
  }, [hydrateTasks]);

  const handleToggleStatus = (id: string, currentStatus: any) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : currentStatus === 'todo' ? 'in-progress' : 'completed';
    updateTask(id, nextStatus);

    if (nextStatus === 'in-progress') {
      addJob?.(`Agent solving task objective: id-${id.slice(-4)}`);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    createTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "Added from manual objectives panel.",
      status: 'todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || "TBD"
    });

    // Add brief latency simulation job
    addJob?.(`Scheduling agent task allocation workflow`);

    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("medium");
    setNewTaskDueDate("TBD");
    setIsDrawerOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-5xl mx-auto overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-nexus-blue" />
              Task Objectives
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Track multi-stage agent workflows, user objectives, and system pipelines.
            </p>
          </div>
          <div>
            <NxActionButton 
              variant="primary" 
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Objective
            </NxActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Section 1: TODO */}
           <div className="space-y-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> To Do
             </h2>
             <div className="space-y-3">
               {tasks.filter(t => t.status === 'todo').map(task => (
                 <TaskCard key={task.id} task={task} onStatusChange={() => handleToggleStatus(task.id, task.status)} onDelete={() => deleteTask(task.id)} />
               ))}
               {tasks.filter(t => t.status === 'todo').length === 0 && (
                 <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-500">No pending objectives.</div>
               )}
             </div>
           </div>

           {/* Section 2: In Progress */}
           <div className="space-y-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> In Progress
             </h2>
             <div className="space-y-3">
               {tasks.filter(t => t.status === 'in-progress').map(task => (
                 <TaskCard key={task.id} task={task} onStatusChange={() => handleToggleStatus(task.id, task.status)} onDelete={() => deleteTask(task.id)} />
               ))}
               {tasks.filter(t => t.status === 'in-progress').length === 0 && (
                 <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-500">No running tasks.</div>
               )}
             </div>
           </div>

           {/* Section 3: Completed */}
           <div className="space-y-4">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
             </h2>
             <div className="space-y-3">
               {tasks.filter(t => t.status === 'completed').map(task => (
                 <TaskCard key={task.id} task={task} onStatusChange={() => handleToggleStatus(task.id, task.status)} onDelete={() => deleteTask(task.id)} />
               ))}
               {tasks.filter(t => t.status === 'completed').length === 0 && (
                 <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-500">No completed objectives.</div>
               )}
             </div>
           </div>
        </div>

        {/* Create Drawer */}
        <NxDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Add Objective">
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
             <div>
               <label className="block text-xs font-medium text-gray-400 mb-1.5">Objective Title</label>
               <NxInput value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="e.g. Test upstream servers" required />
             </div>

             <div>
               <label className="block text-xs font-medium text-gray-400 mb-1.5">Description details</label>
               <textarea 
                 value={newTaskDesc} 
                 onChange={e => setNewTaskDesc(e.target.value)} 
                 placeholder="e.g. Ensure we mock rate limiting exceptions appropriately..."
                 className="flex w-full min-h-20 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nexus-blue"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Priority</label>
                 <NxSelect value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                 </NxSelect>
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Target Date</label>
                 <NxInput value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} placeholder="e.g. Tomorrow or May 26" />
               </div>
             </div>

             <div className="mt-4 flex justify-end gap-3 border-t border-white/5 pt-4">
                <NxActionButton type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</NxActionButton>
                <NxActionButton type="submit" variant="primary">Add Task</NxActionButton>
             </div>
          </form>
        </NxDrawer>

      </div>
    </AppLayout>
  );
}

function TaskCard({ task, onStatusChange, onDelete }: { task: any, onStatusChange: () => void; onDelete: () => void }) {
  const priorityColors = {
    low: "text-gray-400 border-gray-400/20 bg-gray-400/10",
    medium: "text-amber-400 border-amber-400/20 bg-amber-400/10",
    high: "text-red-400 border-red-400/20 bg-red-400/10"
  };

  return (
    <div className={`p-4 rounded-xl border transition-colors group relative ${task.status === 'completed' ? 'bg-white/5 border-white/5 opacity-60' : 'bg-surface-dark border-white/10 hover:border-white/20'}`}>
       <div className="flex items-start gap-3">
         <button 
           onClick={onStatusChange}
           className={`mt-0.5 w-4.5 h-4.5 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer
             ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-500 hover:border-nexus-blue'}
           `}
           title="Toggle status"
         >
           {task.status === 'completed' && <ListTodo className="w-3 h-3 text-white" />}
           {task.status === 'in-progress' && <Clock className="w-3 h-3 text-amber-500" />}
         </button>
         <div className="flex-1 pr-6">
           <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
             {task.title}
           </h3>
           <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
           
           <div className="flex items-center gap-3 mt-3">
             <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${priorityColors[task.priority as 'low'|'medium'|'high'] || ''}`}>
               {task.priority}
             </span>
             <span className="text-[10px] text-gray-500 flex items-center gap-1">
               <Calendar className="w-3 h-3" /> {task.dueDate}
             </span>
           </div>
         </div>
       </div>

       {/* Delete indicator hover-only */}
       <button 
         onClick={onDelete}
         className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded text-gray-500 hover:text-red-400 cursor-pointer"
         title="Erase task goal"
       >
         <AlertCircle className="w-3.5 h-3.5" />
       </button>
    </div>
  );
}
