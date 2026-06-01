import { create } from 'zustand';

export interface WorkflowDefinition {
  steps: any[];
}

export interface Workflow {
  id: string;
  uuid?: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: string;
  version: number;
  latest_version?: {
    definition: WorkflowDefinition;
  };
}

interface WorkflowsState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  definition: WorkflowDefinition | null;
  isLoading: boolean;
  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow) => void;
  setDefinition: (definition: WorkflowDefinition) => void;
  fetchWorkflows: () => Promise<void>;
  fetchWorkflowDefinition: (id: string) => Promise<void>;
}

export const useWorkflowsStore = create<WorkflowsState>((set) => ({
  workflows: [],
  currentWorkflow: null,
  definition: null,
  isLoading: false,
  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  setDefinition: (definition) => set({ definition }),
  fetchWorkflows: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/workflows');
      const data = await response.json();
      set({ workflows: data.data || [] });
    } catch (err) {
      console.error('Failed to fetch workflows', err);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchWorkflowDefinition: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/v1/workflows/${id}`);
      const data = await response.json();
      set({ 
        currentWorkflow: data.data, 
        definition: data.data.latest_version?.definition || { steps: [] } 
      });
    } catch (err) {
      console.error('Failed to fetch workflow definition', err);
    } finally {
      set({ isLoading: false });
    }
  }
}));
