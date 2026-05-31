// Global Types
export type HubName =
  | 'NexusHub'
  | 'ContactsHub'
  | 'AgentsHub'
  | 'WorkflowsHub'
  | 'MemoryHub'
  | 'SettingsHub'
  | 'LogsHub'
  | 'SchedulerHub'
  | 'AIModelsHub';

// Base Component Props
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ErrorResponse {
  error: string;
  success: boolean;
}

// Model Base Type
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactRelationship extends BaseModel {
  contact_id: string;
  related_contact_id: string;
  relationship_type: string;
  mention_count: number;
  confidence: number;
  related_contact?: Partial<Contact>;
}

export interface ContactPreference extends BaseModel {
  contact_id: string;
  preference_type: string;
  value: any;
  confidence: number;
  inferred_from_count: number;
}

export interface ContactAlias extends BaseModel {
  primary_contact_id: string;
  alias_name: string;
  confidence: number;
  created_context?: string;
}

export interface ContactIdentifier extends BaseModel {
  contact_id: string;
  type: string;
  value: string;
  trusted: boolean;
}

export interface ContactNote extends BaseModel {
  contact_id: string;
  user_id?: string;
  note: string;
  summary?: string;
  is_pinned?: boolean;
  metadata?: Record<string, any>;
}

export interface TimelineEvent {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'task';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending';
  source: 'notification' | 'memory' | 'note';
}

export interface Contact extends BaseModel {
  name: string;
  display_name?: string;
  alternate_name?: string;
  type?: string;
  contact_type?: string;
  gender?: string;
  title?: string;
  role?: string;
  company?: string;
  avatar_url?: string;
  avatar?: string;
  last_seen_at?: string;
  last_interaction_at?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  primary_identifier?: string;
  is_active?: boolean;
  reply_mode_override?: string;
  profile_confidence?: number;
  memory_freshness?: string;
  metadata?: Record<string, any>;
  attributes?: Record<string, any>;
  
  // Relations
  relationships?: ContactRelationship[];
  preferences?: ContactPreference[];
  aliases?: ContactAlias[];
  identifiers?: ContactIdentifier[];
  notes?: ContactNote[];
  timeline?: TimelineEvent[];
}

export interface Agent extends BaseModel {
  name: string;
  status: 'active' | 'inactive' | 'busy';
  capabilities: string[];
}

export interface Workflow extends BaseModel {
  name: string;
  status: 'draft' | 'active' | 'archived';
  nodes: any[];
  edges: any[];
}

export interface Task extends BaseModel {
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  workflow_id?: string;
}

export interface Conversation extends BaseModel {
  title: string;
  last_message_at?: string;
}

export interface AIModel extends BaseModel {
  name: string;
  provider: string;
  status: 'healthy' | 'degraded' | 'offline';
}

export interface Log extends BaseModel {
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
}

