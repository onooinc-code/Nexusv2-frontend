import React, { useState, useEffect } from 'react';
import { NxModal } from './NxModal';
import { NxInput } from './NxInput';
import { NxSelect } from './NxSelect';
import { NxActionButton } from './NxActionButton';

interface NxTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any;
  onSave: (data: any) => void;
}

export const NxTaskModal: React.FC<NxTaskModalProps> = ({ isOpen, onClose, task, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 3,
    status: 'todo',
    type: 'agent',
    agent_id: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 3,
        status: task.status || 'todo',
        type: task.type || 'agent',
        agent_id: task.agent_id || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 3,
        status: 'todo',
        type: 'agent',
        agent_id: '',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <NxModal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "Create Task"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <NxInput 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            required
            placeholder="Enter task title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea 
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm text-gray-900 dark:text-gray-100"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <NxSelect 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="manual">Manual</option>
              <option value="agent">Agentic</option>
              <option value="system">System</option>
            </NxSelect>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <NxSelect 
              value={formData.priority.toString()} 
              onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
            >
              <option value="1">Low</option>
              <option value="3">Medium</option>
              <option value="5">High</option>
            </NxSelect>
          </div>
        </div>

        {formData.type === 'agent' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Agent</label>
            <NxSelect 
              value={formData.agent_id} 
              onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
            >
              <option value="">Select an Agent...</option>
              <option value="agent-1">Assistant Agent</option>
              <option value="agent-2">Data Agent</option>
            </NxSelect>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <NxActionButton variant="secondary" onClick={onClose} type="button">Cancel</NxActionButton>
          <NxActionButton type="submit" variant="primary">Save Task</NxActionButton>
        </div>
      </form>
    </NxModal>
  );
};
