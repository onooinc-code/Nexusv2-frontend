import apiClient from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface AiProvider {
  id: string;
  name: string;
  base_url: string;
  models_fetch_endpoint?: string;
  generate_endpoint?: string;
  test_endpoint?: string;
  auth_header_format?: string;
  payload_format?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AiModel {
  id: string;
  name: string;
  provider?: string;
  ai_provider_id?: string;
  description?: string;
  capabilities?: string[];
  status?: string;
}

export interface EcaRule {
  id: number;
  name: string;
  natural_language_rule: string;
  event_type?: string;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  is_active: boolean;
  created_at?: string;
}

export interface ProactiveTrigger {
  id: number;
  eca_rule_id?: number;
  trigger_type: string;
  next_run_at?: string;
  status: string;
  created_at?: string;
}

export interface AutonomousLog {
  id: number;
  action_taken: string;
  reasoning?: string;
  status: string;
  created_at?: string;
}

export interface IntentRoute {
  intent: string;
  provider: string;
  model: string;
  fallbackProvider?: string;
  fallbackModel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Providers API
// ─────────────────────────────────────────────────────────────────────────────
export const aiProvidersApi = {
  list: () => apiClient.get<{ data: AiProvider[] }>('/v1/ai-models/providers'),

  create: (data: Partial<AiProvider>) =>
    apiClient.post<{ success: boolean; data: AiProvider }>('/v1/ai/providers', data),

  test: (id: string) =>
    apiClient.post<{ success: boolean; status: string; message: string; data?: Record<string, unknown> }>(
      `/v1/ai/providers/${id}/test`
    ),

  syncModels: (id: string) =>
    apiClient.post<{ success: boolean; data: AiModel[] }>(
      `/v1/ai/providers/${id}/sync-models`
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Models API
// ─────────────────────────────────────────────────────────────────────────────
export const aiModelsApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<{ data: AiModel[] }>('/v1/ai-models', { params }),

  create: (data: Partial<AiModel>) =>
    apiClient.post<{ data: AiModel }>('/v1/ai-models', data),

  test: (id: string, prompt?: string) =>
    apiClient.post<{ success: boolean; content?: string; test_duration_ms?: number }>(
      `/v1/ai-models/${id}/test`,
      { prompt }
    ),

  delete: (id: string) => apiClient.delete(`/v1/ai-models/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Intent Routing API
// ─────────────────────────────────────────────────────────────────────────────
export const intentRoutingApi = {
  getMatrix: () =>
    apiClient.get<{
      data: {
        intents: { id: string; name: string }[];
        providers: { id: string; name: string; models: { id: string; name: string }[] }[];
        routes: IntentRoute[];
      };
    }>('/v1/ai/intents/routing'),

  updateRoute: (data: Partial<IntentRoute>) =>
    apiClient.put<{ success: boolean; data: IntentRoute }>('/v1/ai/intents/routing', data),
};

// ─────────────────────────────────────────────────────────────────────────────
// ECA Rules (Proactive AI) API
// ─────────────────────────────────────────────────────────────────────────────
export const ecaRulesApi = {
  list: () => apiClient.get<{ data: EcaRule[] }>('/v1/proactive/rules'),
  create: (data: Partial<EcaRule>) =>
    apiClient.post<{ success: boolean; data: EcaRule }>('/v1/proactive/rules', data),
  toggle: (id: number) =>
    apiClient.patch<{ success: boolean }>(`/v1/proactive/rules/${id}/toggle`),
  delete: (id: number) => apiClient.delete(`/v1/proactive/rules/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Proactive Triggers API
// ─────────────────────────────────────────────────────────────────────────────
export const proactiveTriggersApi = {
  list: () => apiClient.get<{ data: ProactiveTrigger[] }>('/v1/proactive/triggers'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Autonomous Logs API
// ─────────────────────────────────────────────────────────────────────────────
export const autonomousLogsApi = {
  list: () => apiClient.get<{ data: AutonomousLog[] }>('/v1/proactive/logs'),
};
