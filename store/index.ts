import { create } from 'zustand';
import apiClient from '@/lib/api/client';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

import { Contact, ContactRelationship, ContactPreference, ContactAlias, ContactIdentifier } from '@/types';

// API Contact type (matches backend response)
export interface ApiContact {
  id: number;
  uuid: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  avatar_url?: string;
  type?: string;
  contact_type?: string;
  display_name?: string;
  alternate_name?: string;
  gender?: string;
  whatsapp_number?: string;
  primary_identifier?: string;
  reply_mode_override?: string;
  profile_confidence?: number;
  memory_freshness?: string;
  last_interaction_at?: string;
  title?: string;
  is_active?: boolean;
  last_seen_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface Workflow {
  id: string;
  name: string;
  role: string;
  status: 'draft' | 'active' | 'archived';
  nodesCount: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline' | 'error';
  tokenUsage: number;
  model: string;
  temperature: number;
  memorySync: boolean;
  capabilities: string[];
  assignedTasks: string[]; // Task IDs assigned to this agent
}

export interface MemoryItem {
  id: string;
  fact: string;
  type: 'semantic' | 'episodic' | 'working';
  relevance: number;
  agentName: string;
  timestamp: string;
  metaTags: string[];
}

export interface AgentPersona {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  tone_preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  type: 'local' | 'remote';
  status: 'online' | 'offline' | 'error' | 'connected' | 'disconnected';
  connection_config: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed';
  progress: number; // 0-100
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

// Global state specification
export interface GlobalState {
  // Navigation & UI States
  isSidebarOpen: boolean;
  isOnline: boolean;
  isJobMonitorOpen: boolean;
  isNotificationDrawerOpen: boolean;
  
  // Loading Registry
  loading: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;

  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setOnline: (online: boolean) => void;
  setJobMonitorOpen: (isOpen: boolean) => void;
  setNotificationDrawerOpen: (isOpen: boolean) => void;

  // Notification / Toast slice
  notifications: ToastMessage[];
  addNotification: (type: ToastMessage['type'], message: string) => void;
  dismissNotification: (id: string) => void;

  // Active Job Slice
  jobs: Job[];
  addJob: (name: string, backendJobId: string) => void;
  updateJobProgress: (id: string, progress: number, status?: Job['status']) => void;
  cancelJob: (id: string) => void;
  clearCompletedJobs: () => void;

  // Contacts Slice
  contacts: Contact[];
  currentContact: Contact | null;
  hydrateContacts: () => void;
  fetchContactDetails: (id: string) => Promise<void>;
  createContact: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  fetchContactTimeline: (id: string) => Promise<void>;
  fetchContactNotes: (id: string) => Promise<void>;
  addContactNote: (id: string, note: any) => Promise<void>;
  deleteContactNote: (id: string, noteId: string) => Promise<void>;

  // Contact Relations API
  addContactRelationship: (contactId: string, data: any) => Promise<void>;
  deleteContactRelationship: (contactId: string, relationshipId: string) => Promise<void>;
  
  addContactPreference: (contactId: string, data: any) => Promise<void>;
  updateContactPreference: (contactId: string, prefId: string, data: any) => Promise<void>;
  deleteContactPreference: (contactId: string, prefId: string) => Promise<void>;

  addContactAlias: (contactId: string, data: any) => Promise<void>;
  deleteContactAlias: (contactId: string, aliasId: string) => Promise<void>;

  // Tasks Slice
  tasks: Task[];
  hydrateTasks: () => Promise<void>;
  createTask: (data: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;

  // Workflows Slice
  workflows: Workflow[];
  hydrateWorkflows: () => Promise<void>;
  createWorkflow: (data: Omit<Workflow, 'id'>) => void;
  updateWorkflow: (id: string, data: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;

  // Agents Slice
  agents: Agent[];
  hydrateAgents: () => Promise<void>;
  simulateAgent: (id: string, payload: any) => Promise<any>;
  runAgent: (id: string, payload: any) => Promise<any>;
  quarantineAgent: (id: string, reason: string) => Promise<void>;
  fetchAgentStatus: (id: string) => Promise<void>;

  // Agent Personas Slice
  personas: AgentPersona[];
  hydratePersonas: () => Promise<void>;
  createPersona: (data: Omit<AgentPersona, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePersona: (id: string, data: Partial<AgentPersona>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;

  // MCP Servers Slice
  mcpServers: MCPServer[];
  hydrateMCPServers: () => Promise<void>;
  createMCPServer: (data: Omit<MCPServer, 'id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMCPServer: (id: string, data: Partial<MCPServer>) => Promise<void>;
  deleteMCPServer: (id: string) => Promise<void>;
  connectMCPServer: (name: string) => Promise<void>;
  disconnectMCPServer: (name: string) => Promise<void>;

  // Memories Slice
  memories: MemoryItem[];
  hydrateMemories: () => void;
  createMemory: (data: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  deleteMemory: (id: string) => void;
  resetAllMemories: () => void;
}

// Sample Fallback Seed Data
const DEFAULT_CONTACTS: Contact[] = [
  { id: "1", name: "Dr. Evelyn Wright", role: "Senior Cognitive Systems Architect", company: "Neuralis Research Labs", email: "evelyn.wright@neuralis.io", phone: "+1 (555) 328-9482", avatar: "https://picsum.photos/seed/evelyn/120/120", created_at: "2026-05-22T14:00:00Z", updated_at: "2026-05-22T14:00:00Z" },
  { id: "2", name: "Marcus Vance", role: "Director of Strategic Alliances", company: "Apex HyperScale Corp", email: "m.vance@apexscale.com", phone: "+1 (555) 439-0112", avatar: "https://picsum.photos/seed/marcus/120/120", created_at: "2026-05-22T14:00:00Z", updated_at: "2026-05-22T14:00:00Z" },
  { id: "3", name: "Aisha Rahman", role: "Lead API Devrel Coordinator", company: "Synapse Synthesis", email: "aisha.r@synapsesynth.dev", phone: "+31 20 541 9831", avatar: "https://picsum.photos/seed/aisha/120/120", created_at: "2026-05-22T14:00:00Z", updated_at: "2026-05-22T14:00:00Z" },
  { id: "4", name: "Julian Sterling", role: "Principal Venture Partner", company: "Horizon AI Ventures", email: "julian@sterlinghorizon.capital", phone: "+44 20 7946 0958", avatar: "https://picsum.photos/seed/julian/120/120", created_at: "2026-05-22T14:00:00Z", updated_at: "2026-05-22T14:00:00Z" }
];

const DEFAULT_TASKS: Task[] = [
  { id: "1", title: "Review Phase 2 architecture", description: "Verify token allocations for memory synchronization.", status: 'todo', priority: 'high', dueDate: "Tomorrow" },
  { id: "2", title: "Refactor API bindings", description: "Ensure Nexus Blue palette is applied everywhere.", status: 'in-progress', priority: 'medium', dueDate: "May 25" },
  { id: "3", title: "Deploy metrics dashboard", description: "Ship the new visualizations.", status: 'completed', priority: 'low', dueDate: "Yesterday" }
];

const DEFAULT_WORKFLOWS: Workflow[] = [
  { id: "1", name: "Data Enrichment Cascade", role: "API ingestion & cleansing pipeline", status: 'active', nodesCount: 5 },
  { id: "2", title: "Outbound Outreach Loop", role: "Automated communications feedback loop", status: 'draft', nodesCount: 3 } as any, // fallback compatible
  { id: "3", name: "Memory Consolidation Chunking", role: "Episodic archive packager", status: 'active', nodesCount: 4 }
];

const DEFAULT_MEMORIES: MemoryItem[] = [
  { id: "1", fact: "Dr. Evelyn Wright prefers asynchronous briefing summaries prior to voice coordinators initiating Outreach pings.", type: "semantic", relevance: 0.94, agentName: "Ingestion Alpha", timestamp: "2026-05-22 14:02", metaTags: ["communications", "workflow-pref"] },
  { id: "2", fact: "Primary pipeline ingestion experienced transient 429 rate limit exceptions on APEX cloud clusters, resolved within 14 seconds.", type: "episodic", relevance: 0.82, agentName: "Orchestrator Core", timestamp: "2026-05-22 18:15", metaTags: ["exceptions", "network"] },
  { id: "3", fact: "Temporary auth token nexus_auth_token set in state with 3600 second expiry limit.", type: "working", relevance: 0.61, agentName: "Ingestion Alpha", timestamp: "2026-05-22 20:11", metaTags: ["auth", "token-states"] },
  { id: "4", fact: "Horizon AI Ventures concluded Series B funding rounds with primary allocations directed to cognitive reasoning networks.", type: "semantic", relevance: 0.87, agentName: "Fact Synthesizer", timestamp: "2026-05-21 09:30", metaTags: ["ventures", "funding-rounds"] }
];

export const useGlobalStore = create<GlobalState>((set, get) => ({
  // Navigation & UI States
  isSidebarOpen: true,
  isOnline: true,
  isJobMonitorOpen: false,
  isNotificationDrawerOpen: false,
  loading: {},

  setLoading: (key, isLoading) => set((state) => ({
    loading: { ...state.loading, [key]: isLoading }
  })),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setOnline: (online) => set({ isOnline: online }),
  setJobMonitorOpen: (isOpen) => set({ isJobMonitorOpen: isOpen }),
  setNotificationDrawerOpen: (isOpen) => set({ isNotificationDrawerOpen: isOpen }),

  // Notifications slice
  notifications: [],
  addNotification: (type, message) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newToast: ToastMessage = { id, type, message };
    set((state) => ({ notifications: [...state.notifications, newToast] }));

    // Auto-dismiss after default 4000ms
    setTimeout(() => {
      get().dismissNotification(id);
    }, 4000);
  },
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Backround Jobs tracker
  jobs: [],
  addJob: (name, backendJobId) => {
    const newJob: Job = { id: backendJobId, name, status: 'running', progress: 0 };
    set((state) => ({ jobs: [newJob, ...state.jobs], isJobMonitorOpen: true }));
    get().addNotification('info', `Job started: ${name}`);
  },
  updateJobProgress: (id, progress, status) => set((state) => ({
    jobs: state.jobs.map(j => j.id === id ? { ...j, progress, ...(status ? { status } : {}) } : j)
  })),
  cancelJob: (id) => {
    const job = get().jobs.find(j => j.id === id);
    if (job) {
      set((state) => ({
        jobs: state.jobs.map(j => j.id === id ? { ...j, status: 'failed', progress: 0 } as Job : j)
      }));
      get().addNotification('warning', `Aborted: ${job.name}`);
    }
  },
  clearCompletedJobs: () => set((state) => ({
    jobs: state.jobs.filter(j => j.status === 'running')
  })),

  // Contacts Slice - API Integration
  contacts: [],
  currentContact: null,
  hydrateContacts: async () => {
    get().setLoading('contacts', true);
    try {
      const response = await apiClient.get('/v1/contacts');
      const apiContacts = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data.data?.data)
          ? response.data.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

      // Transform API contacts to frontend format
      const contacts: Contact[] = apiContacts.map((c: ApiContact) => ({
        id: c.id.toString(),
        name: c.name,
        role: c.role || c.title || '',
        company: c.company || '',
        email: c.email || '',
        phone: c.phone || '',
        whatsapp_number: c.whatsapp_number || '',
        display_name: c.display_name,
        alternate_name: c.alternate_name,
        contact_type: c.contact_type || c.type,
        type: c.type,
        gender: c.gender,
        primary_identifier: c.primary_identifier,
        reply_mode_override: c.reply_mode_override,
        profile_confidence: c.profile_confidence,
        memory_freshness: c.memory_freshness,
        last_interaction_at: c.last_interaction_at,
        avatar: c.avatar_url,
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
      }));
      set({ contacts });
    } catch (error) {
      logError('Failed to fetch contacts', error);
      get().addNotification('error', 'Failed to load contacts');
    } finally {
      get().setLoading('contacts', false);
    }
  },
  fetchContactDetails: async (id: string) => {
    try {
      const response = await apiClient.get(`/v1/contacts/${id}`);
      const c = response.data.data || response.data;
      const contactDetail: Contact = {
        ...c,
        id: c.id.toString(),
        role: c.role || c.title || '',
        avatar: c.avatar_url,
      };
      set({ currentContact: contactDetail });
    } catch (error) {
      logError('Failed to fetch contact details', error);
      get().addNotification('error', 'Failed to load contact details');
    }
  },
  createContact: async (data) => {
    const tempId = `temp-${Date.now()}`;
    const tempContact: Contact = {
      id: tempId,
      name: data.name,
      role: data.role || '',
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar: data.avatar,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    set((state) => ({ contacts: [...state.contacts, tempContact] }));

    try {
      const payload = {
        name: data.name,
        title: data.role,
        company: data.company,
        email: data.email,
        phone: data.phone,
        avatar_url: data.avatar,
      };

      const response = await apiClient.post('/v1/contacts', payload);
      const apiContact = response.data.data || response.data;
      const newContact: Contact = {
        id: apiContact.id.toString(),
        name: apiContact.name,
        role: apiContact.role || apiContact.title || '',
        company: apiContact.company || '',
        email: apiContact.email || '',
        phone: apiContact.phone || '',
        avatar: apiContact.avatar_url,
        created_at: apiContact.created_at || new Date().toISOString(),
        updated_at: apiContact.updated_at || new Date().toISOString(),
      };

      // Replace temp contact with real one
      set((state) => ({
        contacts: state.contacts.map(c => c.id === tempId ? newContact : c)
      }));

      get().addNotification('success', `Created contact profile for ${data.name}`);
    } catch (error) {
      // Rollback: Remove the temp contact
      set((state) => ({ contacts: state.contacts.filter(c => c.id !== tempId) }));
      logError('Failed to create contact', error);
      get().addNotification('error', 'Failed to create contact');
    }
  },
  updateContact: async (id, data) => {
    const oldContact = get().contacts.find(c => c.id === id);
    if (!oldContact) return;

    // Optimistic update
    set((state) => ({
      contacts: state.contacts.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
    }));

    try {
      const payload = { ...data } as any;
      if (payload.role) {
        payload.title = payload.role;
        delete payload.role;
      }

      const response = await apiClient.put(`/v1/contacts/${id}`, payload);
      const apiContact = response.data.data || response.data;
      set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? {
          ...c,
          name: apiContact.name || c.name,
          role: apiContact.role || apiContact.title || c.role,
          company: apiContact.company || c.company,
          email: apiContact.email || c.email,
          phone: apiContact.phone || c.phone,
          avatar: apiContact.avatar_url || c.avatar,
          updated_at: new Date().toISOString(),
        } : c)
      }));
      get().addNotification('success', `Updated contact profile for ${apiContact.name || data.name || 'contact'}`);
    } catch (error) {
      // Rollback to original contact state
      set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? oldContact : c)
      }));
      logError('Failed to update contact', error);
      get().addNotification('error', 'Failed to update contact');
    }
  },
  deleteContact: async (id) => {
    try {
      const contact = get().contacts.find(c => c.id === id);
      await apiClient.delete(`/v1/contacts/${id}`);
      set((state) => ({ contacts: state.contacts.filter(c => c.id !== id) }));
      get().addNotification('success', 'Profile archived');
    } catch (error) {
      logError('Failed to delete contact', error);
      get().addNotification('error', 'Failed to delete contact');
    }
  },

  fetchContactTimeline: async (id) => {
    try {
      const response = await apiClient.get(`/v1/contacts/${id}/timeline`);
      const events = response.data.data || response.data;
      set((state) => ({
        currentContact: state.currentContact && state.currentContact.id === id
          ? { ...state.currentContact, timeline: events }
          : state.currentContact
      }));
    } catch (error) {
      logError('Failed to fetch contact timeline', error);
    }
  },
  fetchContactNotes: async (id) => {
    try {
      const response = await apiClient.get(`/v1/contacts/${id}/notes`);
      const notes = response.data.data || response.data;
      set((state) => ({
        currentContact: state.currentContact && state.currentContact.id === id
          ? { ...state.currentContact, notes }
          : state.currentContact
      }));
    } catch (error) {
      logError('Failed to fetch contact notes', error);
    }
  },
  addContactNote: async (id, data) => {
    try {
      await apiClient.post(`/v1/contacts/${id}/notes`, data);
      await get().fetchContactNotes(id);
      get().addNotification('success', 'Added system note');
    } catch (error) {
      logError('Failed to add contact note', error);
      get().addNotification('error', 'Failed to add note');
    }
  },
  deleteContactNote: async (id, noteId) => {
    try {
      await apiClient.delete(`/v1/contacts/${id}/notes/${noteId}`);
      await get().fetchContactNotes(id);
      get().addNotification('success', 'Note removed');
    } catch (error) {
      logError('Failed to delete contact note', error);
      get().addNotification('error', 'Failed to remove note');
    }
  },

  // Contact Relations API
  addContactRelationship: async (contactId, data) => {
    try {
      await apiClient.post(`/v1/contacts/${contactId}/relationships`, data);
      await get().fetchContactDetails(contactId);
      get().addNotification('success', 'Relationship added');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to add relationship');
    }
  },
  deleteContactRelationship: async (contactId, relationshipId) => {
    try {
      await apiClient.delete(`/v1/contacts/${contactId}/relationships/${relationshipId}`);
      await get().fetchContactDetails(contactId);
      get().addNotification('warning', 'Relationship removed');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to remove relationship');
    }
  },
  
  addContactPreference: async (contactId, data) => {
    try {
      await apiClient.post(`/v1/contacts/${contactId}/preferences`, data);
      await get().fetchContactDetails(contactId);
      get().addNotification('success', 'Preference added');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to add preference');
    }
  },
  updateContactPreference: async (contactId, prefId, data) => {
    try {
      await apiClient.put(`/v1/contacts/${contactId}/preferences/${prefId}`, data);
      await get().fetchContactDetails(contactId);
      get().addNotification('success', 'Preference updated');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to update preference');
    }
  },
  deleteContactPreference: async (contactId, prefId) => {
    try {
      await apiClient.delete(`/v1/contacts/${contactId}/preferences/${prefId}`);
      await get().fetchContactDetails(contactId);
      get().addNotification('warning', 'Preference removed');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to remove preference');
    }
  },

  addContactAlias: async (contactId, data) => {
    try {
      await apiClient.post(`/v1/contacts/${contactId}/aliases`, data);
      await get().fetchContactDetails(contactId);
      get().addNotification('success', 'Alias added');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to add alias');
    }
  },
  deleteContactAlias: async (contactId, aliasId) => {
    try {
      await apiClient.delete(`/v1/contacts/${contactId}/aliases/${aliasId}`);
      await get().fetchContactDetails(contactId);
      get().addNotification('warning', 'Alias removed');
    } catch (error) {
      console.error(error);
      get().addNotification('error', 'Failed to remove alias');
    }
  },

  // Tasks Slice
  tasks: [],
  hydrateTasks: async () => {
    get().setLoading('tasks', true);
    try {
      const response = await apiClient.get('/v1/tasks');
      const data = response.data.data || response.data;
      
      const tasks: Task[] = (Array.isArray(data) ? data : []).map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        description: t.description || '',
        status: t.status || 'todo',
        priority: t.priority || 'medium',
        dueDate: t.due_date || t.dueDate || '',
      }));

      set({ tasks });
    } catch (error) {
      logError('Failed to fetch tasks', error);
      get().addNotification('error', 'Failed to load objectives');
    } finally {
      get().setLoading('tasks', false);
    }
  },
  createTask: async (data) => {
    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      ...data,
    };

    // Optimistic update
    set((state) => ({ tasks: [...state.tasks, tempTask] }));

    try {
      const payload = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.dueDate,
      };

      const response = await apiClient.post('/v1/tasks', payload);
      const apiTask = response.data.data || response.data;

      const newTask: Task = {
        id: apiTask.id.toString(),
        title: apiTask.title,
        description: apiTask.description || '',
        status: apiTask.status || 'todo',
        priority: apiTask.priority || 'medium',
        dueDate: apiTask.due_date || apiTask.dueDate || '',
      };

      // Replace temp task with the real record from the API
      set((state) => ({
        tasks: state.tasks.map(t => t.id === tempId ? newTask : t)
      }));

      get().addNotification('success', `Objective synthesized: ${data.title}`);
    } catch (error) {
      // Rollback: Remove the temporary task from the UI
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
      logError('Failed to create task', error);
      get().addNotification('error', 'Neural grid synchronization failed');
    }
  },
  updateTask: (id, status) => {
    const updated = get().tasks.map(t => t.id === id ? { ...t, status } : t);
    set({ tasks: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_tasks', JSON.stringify(updated));
  },
  deleteTask: (id) => {
    const updated = get().tasks.filter(t => t.id !== id);
    set({ tasks: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_tasks', JSON.stringify(updated));
    get().addNotification('info', `Archived objective objective-id-${id}`);
  },

  // Workflows Slice
  workflows: [],
  hydrateWorkflows: async () => {
    try {
      const response = await apiClient.get('/v1/workflows');
      const data = response.data.data || response.data;

      const workflows: Workflow[] = (Array.isArray(data) ? data : []).map((w: any) => ({
        id: w.id.toString(),
        name: w.name || w.title || 'Unknown Workflow',
        role: w.role || w.description || '',
        status: w.status || 'draft',
        nodesCount: w.nodes_count || w.nodesCount || 0,
      }));

      set({ workflows });
    } catch (error) {
      logError('Failed to fetch workflows', error);
      get().addNotification('error', 'Failed to load orchestration pipelines');
    }
  },
  createWorkflow: (data) => {
    const newWf: Workflow = { ...data, id: Date.now().toString() };
    const updated = [...get().workflows, newWf];
    set({ workflows: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_workflows', JSON.stringify(updated));
    get().addNotification('success', `Created automated workflow: ${data.name}`);
  },
  updateWorkflow: (id, data) => {
    const updated = get().workflows.map(w => w.id === id ? { ...w, ...data } : w);
    set({ workflows: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_workflows', JSON.stringify(updated));
  },
  deleteWorkflow: (id) => {
    const updated = get().workflows.filter(w => w.id !== id);
    set({ workflows: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_workflows', JSON.stringify(updated));
    get().addNotification('warning', `Dismantled orchestration workflow`);
  },

  // Agents Slice
  agents: [],
  hydrateAgents: async () => {
    get().setLoading('agents', true);
    try {
      const response = await apiClient.get('/v1/agents');
      // Laravel paginate() returns { data: { data: [...], total, ... } }
      // Laravel collection() returns { data: [...] }
      const raw = response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);

      const agents: Agent[] = list.map((a: any) => ({
        id: a.id.toString(),
        name: a.name,
        role: a.type_label || a.type || 'general',
        status: a.status === 'active' ? 'online' : a.status === 'quarantined' ? 'error' : 'offline',
        tokenUsage: a.execution_count || 0,
        model: a.settings?.ai_model_id || 'default',
        temperature: a.settings?.temperature || 0.7,
        memorySync: true,
        capabilities: a.tools?.map((t: any) => t.name) ?? [],
        assignedTasks: [],
      }));

      set({ agents });
    } catch (error) {
      logError('Failed to fetch agents', error);
      get().addNotification('error', 'Failed to load agents');
    } finally {
      get().setLoading('agents', false);
    }
  },
  simulateAgent: async (id, payload) => {
    try {
      // Backend expects { input: <string|object>, mock_tools?: {} }
      const body = { input: payload.task ?? payload.input ?? payload, mock_tools: payload.mock_tools ?? {} };
      const response = await apiClient.post(`/v1/agents/${id}/simulate`, body);
      get().addNotification('info', `Simulation completed for agent ${id}`);
      return response.data;
    } catch (error) {
      console.error('Simulation failed:', error);
      get().addNotification('error', 'Agent simulation failed');
      throw error;
    }
  },
  runAgent: async (id, payload) => {
    try {
      // Backend expects { input: <string|object>, async?: boolean }
      const body = { input: payload.task ?? payload.input ?? payload };
      const response = await apiClient.post(`/v1/agents/${id}/run`, body);
      get().addNotification('success', `Agent execution started`);
      return response.data;
    } catch (error) {
      console.error('Execution failed:', error);
      get().addNotification('error', 'Agent execution failed');
      throw error;
    }
  },
  quarantineAgent: async (id, reason) => {
    try {
      await apiClient.post(`/v1/agents/${id}/quarantine`, { reason });
      set((state) => ({
        agents: state.agents.map(a => a.id === id ? { ...a, status: 'error' } : a)
      }));
      get().addNotification('warning', `Agent quarantined: ${reason}`);
    } catch (error) {
      console.error('Quarantine failed:', error);
      get().addNotification('error', 'Failed to quarantine agent');
    }
  },
  fetchAgentStatus: async (id) => {
    try {
      const response = await apiClient.get(`/v1/agents/${id}/status`);
      const statusData = response.data.data || response.data;
      set((state) => ({
        agents: state.agents.map(a => a.id === id ? { 
          ...a, 
          status: statusData.status === 'active' ? 'online' : statusData.status === 'quarantined' ? 'error' : 'offline',
          tokenUsage: statusData.execution_count || a.tokenUsage 
        } : a)
      }));
    } catch (error) {
      logError('Failed to fetch agent status', error);
    }
  },

  // Agent Personas Slice
  personas: [],
  hydratePersonas: async () => {
    get().setLoading('personas', true);
    try {
      const response = await apiClient.get('/v1/agent-personas');
      const raw = response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      const personas = list.map((p: any) => ({
        ...p,
        id: p.id.toString(),
      }));
      set({ personas });
    } catch (error) {
      logError('Failed to fetch personas', error);
      get().addNotification('error', 'Failed to load Personas');
    } finally {
      get().setLoading('personas', false);
    }
  },
  createPersona: async (data) => {
    try {
      const response = await apiClient.post('/v1/agent-personas', data);
      const apiPersona = response.data?.data ?? response.data;
      set((state) => ({ personas: [...state.personas, { ...apiPersona, id: apiPersona.id.toString() }] }));
      get().addNotification('success', `Created persona: ${data.name}`);
    } catch (error) {
      logError('Failed to create persona', error);
      get().addNotification('error', 'Failed to create persona');
      throw error;
    }
  },
  updatePersona: async (id, data) => {
    try {
      const response = await apiClient.put(`/v1/agent-personas/${id}`, data);
      const apiPersona = response.data?.data ?? response.data;
      set((state) => ({
        personas: state.personas.map(p => p.id === id ? { ...p, ...apiPersona, id: apiPersona.id.toString() } : p)
      }));
      get().addNotification('success', `Updated persona`);
    } catch (error) {
      logError('Failed to update persona', error);
      get().addNotification('error', 'Failed to update persona');
      throw error;
    }
  },
  deletePersona: async (id) => {
    try {
      await apiClient.delete(`/v1/agent-personas/${id}`);
      set((state) => ({ personas: state.personas.filter(p => p.id !== id) }));
      get().addNotification('success', 'Persona deleted');
    } catch (error: any) {
      logError('Failed to delete persona', error);
      const msg = error.response?.data?.message || 'Failed to delete persona';
      get().addNotification('error', msg);
    }
  },

  // MCP Servers Slice
  mcpServers: [],
  hydrateMCPServers: async () => {
    get().setLoading('mcpServers', true);
    try {
      const response = await apiClient.get('/v1/mcp-servers');
      const raw = response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      const mcpServers = list.map((s: any) => ({
        ...s,
        id: s.id.toString(),
      }));
      set({ mcpServers });
    } catch (error) {
      logError('Failed to fetch MCP servers', error);
      get().addNotification('error', 'Failed to load MCP Servers');
    } finally {
      get().setLoading('mcpServers', false);
    }
  },
  createMCPServer: async (data) => {
    try {
      const response = await apiClient.post('/v1/mcp-servers', data);
      const apiServer = response.data?.data ?? response.data;
      set((state) => ({ mcpServers: [...state.mcpServers, { ...apiServer, id: apiServer.id.toString() }] }));
      get().addNotification('success', `Registered MCP server: ${data.name}`);
    } catch (error) {
      logError('Failed to create MCP server', error);
      get().addNotification('error', 'Failed to register MCP server');
      throw error;
    }
  },
  updateMCPServer: async (id, data) => {
    try {
      const response = await apiClient.put(`/v1/mcp-servers/${id}`, data);
      const apiServer = response.data?.data ?? response.data;
      set((state) => ({
        mcpServers: state.mcpServers.map(s => s.id === id ? { ...s, ...apiServer, id: apiServer.id.toString() } : s)
      }));
      get().addNotification('success', `Updated MCP server`);
    } catch (error) {
      logError('Failed to update MCP server', error);
      get().addNotification('error', 'Failed to update MCP server');
      throw error;
    }
  },
  deleteMCPServer: async (id) => {
    try {
      await apiClient.delete(`/v1/mcp-servers/${id}`);
      set((state) => ({ mcpServers: state.mcpServers.filter(s => s.id !== id) }));
      get().addNotification('success', 'MCP server removed');
    } catch (error) {
      logError('Failed to delete MCP server', error);
      get().addNotification('error', 'Failed to remove MCP server');
    }
  },
  connectMCPServer: async (name) => {
    try {
      await apiClient.post(`/v1/mcp-servers/${name}/connect`);
      get().addNotification('success', `Connected to MCP server: ${name}`);
      get().hydrateMCPServers();
    } catch (error) {
      logError('Failed to connect MCP server', error);
      get().addNotification('error', `Failed to connect to ${name}`);
    }
  },
  disconnectMCPServer: async (name) => {
    try {
      await apiClient.post(`/v1/mcp-servers/${name}/disconnect`);
      get().addNotification('warning', `Disconnected from MCP server: ${name}`);
      get().hydrateMCPServers();
    } catch (error) {
      logError('Failed to disconnect MCP server', error);
      get().addNotification('error', `Failed to disconnect from ${name}`);
    }
  },

  // Memories Slice
  memories: [],
  hydrateMemories: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('nexus_memories');
      if (saved) {
        set({ memories: JSON.parse(saved) });
      } else {
        localStorage.setItem('nexus_memories', JSON.stringify(DEFAULT_MEMORIES));
        set({ memories: DEFAULT_MEMORIES });
      }
    } catch {
      set({ memories: DEFAULT_MEMORIES });
    }
  },
  createMemory: (data) => {
    const newMemory: MemoryItem = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    const updated = [newMemory, ...get().memories];
    set({ memories: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_memories', JSON.stringify(updated));
    get().addNotification('success', `Synthesized new knowledge chunk`);
  },
  deleteMemory: (id) => {
    const updated = get().memories.filter(m => m.id !== id);
    set({ memories: updated });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_memories', JSON.stringify(updated));
    get().addNotification('info', `Purged episodic context unit from neural partition`);
  },
  resetAllMemories: () => {
    set({ memories: DEFAULT_MEMORIES });
    if (typeof window !== 'undefined') localStorage.setItem('nexus_memories', JSON.stringify(DEFAULT_MEMORIES));
    get().addNotification('warning', `Flushed episodic caching registers`);
  }
}));
