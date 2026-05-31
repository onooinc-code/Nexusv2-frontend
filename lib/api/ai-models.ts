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
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
  /** Eager-loaded relation from backend with('models') */
  models?: AiModel[];
  models_count?: number;
}

export interface AiModel {
  id: string;
  name: string;
  provider_id?: string;
  provider?: string;
  ai_provider_id?: string;
  description?: string;
  capabilities?: string[];
  status?: string;
  cost_profile?: string;
  latency_profile?: string;
  security_class?: string;
  quality_tier?: string;
  language_support?: string[];
  last_synced_at?: string;
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

export interface ProviderHealthRecord {
  provider_id: string;
  status: 'healthy' | 'degraded' | 'offline';
  avg_latency: number;
}

export interface CostForecast {
  current_spend: number;
  monthly_limit: number;
  remaining_budget: number;
  forecasted_total: number;
  daily_average: number;
  status: 'healthy' | 'over_budget_predicted' | 'budget_exceeded';
}

export interface AiAuditEntry {
  id: number;
  event_type: string;
  provider_id: string | null;
  model_id: string | null;
  intent: string | null;
  status: string;
  latency_ms: number;
  fallback_triggered: boolean;
  input_tokens: number;
  output_tokens: number;
  error_type: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Providers API
// ─────────────────────────────────────────────────────────────────────────────
export const aiProvidersApi = {
  list: () =>
    apiClient.get<{ success: boolean; data: AiProvider[] }>('/v1/ai/providers'),

  get: (id: string) =>
    apiClient.get<{ success: boolean; data: AiProvider }>(`/v1/ai/providers/${id}`),

  create: (data: Partial<AiProvider> & { api_key?: string }) =>
    apiClient.post<{ success: boolean; data: AiProvider; message: string }>('/v1/ai/providers', data),

  update: (id: string, data: Partial<AiProvider> & { api_key?: string }) =>
    apiClient.put<{ success: boolean; data: AiProvider; message: string }>(`/v1/ai/providers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/v1/ai/providers/${id}`),

  /** Toggle the is_active flag without requiring all other fields */
  toggleActive: (id: string, isActive: boolean) =>
    apiClient.patch<{ success: boolean; data: AiProvider; message: string }>(
      `/v1/ai/providers/${id}/toggle-active`,
      { is_active: isActive }
    ),

  test: (id: string) =>
    apiClient.post<{ success: boolean; status: string; message: string; data?: Record<string, unknown> }>(
      `/v1/ai/providers/${id}/test`
    ),

  syncModels: (id: string) =>
    apiClient.post<{
      success: boolean;
      data: AiModel[];
      synced_count: number;
      total_count: number;
      message: string;
    }>(`/v1/ai/providers/${id}/sync-models`),
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
// Health Monitoring API
// ─────────────────────────────────────────────────────────────────────────────
export const aiHealthApi = {
  getScorecard: () =>
    apiClient.get<{ success: boolean; data: Record<string, ProviderHealthRecord> }>(
      '/v1/ai/providers/health'
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Cost Analytics & Budget API
// ─────────────────────────────────────────────────────────────────────────────
export const aiCostApi = {
  getForecast: () =>
    apiClient.get<{ success: boolean; data: CostForecast }>('/v1/ai/cost/forecast'),

  setBudget: (monthlyLimit: number, workspaceId?: string) =>
    apiClient.post<{ success: boolean; message: string }>('/v1/ai/cost/budget', {
      monthly_limit: monthlyLimit,
      workspace_id: workspaceId,
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Audit Trail API
// ─────────────────────────────────────────────────────────────────────────────
export const aiAuditApi = {
  list: (params?: { event_type?: string; status?: string; limit?: number }) =>
    apiClient.get<{ success: boolean; data: AiAuditEntry[] }>('/v1/ai/audit-trail', { params }),
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
