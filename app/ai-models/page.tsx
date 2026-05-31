"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxStatusBadge } from '@/components/NxStatusBadge';
import { GridCardSkeleton } from '@/components/SkeletonLoaders';
import {
  Sparkles, RefreshCw, PlusCircle, Zap, Server, Globe, CheckCircle,
  XCircle, Loader2, X, ChevronRight, Settings2, Activity, DollarSign,
  ShieldCheck, ClipboardList, TrendingUp, AlertTriangle, Info, Edit2, Trash2,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Database,
} from 'lucide-react';
import {
  aiProvidersApi, aiModelsApi, aiHealthApi, aiCostApi, aiAuditApi,
  intentRoutingApi, AiProvider, AiModel, IntentRoute,
  ProviderHealthRecord, CostForecast, AiAuditEntry,
} from '@/lib/api/ai-models';

type TestState = 'idle' | 'testing' | 'success' | 'failed';
type SyncState = 'idle' | 'syncing' | 'done' | 'error';
type Tab = 'providers' | 'routing' | 'health' | 'analytics' | 'audit';

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ProviderWithState extends AiProvider {
  testState: TestState;
  syncState: SyncState;
  latency?: number;
  syncedModels: AiModel[];
}

// ─── Toast System ──────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-right-5 fade-in duration-300 ${
            t.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          )}
          <span className="text-sm flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="text-gray-500 hover:text-white transition-colors ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}

// ─── Shared Field Types ────────────────────────────────────────────────────────
type ProviderFormFields = {
  name: string;
  base_url: string;
  models_fetch_endpoint: string;
  generate_endpoint: string;
  test_endpoint: string;
  auth_header_format: string;
  payload_format: string;
  api_key: string;
};

const defaultForm: ProviderFormFields = {
  name: '',
  base_url: '',
  models_fetch_endpoint: '/v1/models',
  generate_endpoint: '/v1/chat/completions',
  test_endpoint: '/v1/models',
  auth_header_format: 'Bearer {KEY}',
  payload_format: 'openai',
  api_key: '',
};

const PAYLOAD_FORMATS = ['openai', 'anthropic', 'gemini', 'ollama', 'custom'];

type TextFieldKey = Exclude<keyof ProviderFormFields, 'payload_format'>;

const TEXT_FIELDS: { key: TextFieldKey; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Provider Name', placeholder: 'e.g. OpenAI, Groq, Ollama' },
  { key: 'base_url', label: 'Base URL', placeholder: 'https://api.openai.com' },
  { key: 'models_fetch_endpoint', label: 'Models Endpoint', placeholder: '/v1/models' },
  { key: 'generate_endpoint', label: 'Generate Endpoint', placeholder: '/v1/chat/completions' },
  { key: 'test_endpoint', label: 'Test / Ping Endpoint', placeholder: '/v1/models' },
  { key: 'auth_header_format', label: 'Auth Header Format', placeholder: 'Bearer {KEY}' },
  { key: 'api_key', label: 'API Key', placeholder: 'sk-... (leave blank to keep existing)' },
];

// ─── Add / Edit Provider Modal ─────────────────────────────────────────────────
function ProviderFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit';
  initial?: AiProvider;
  onClose: () => void;
  onSaved: (p: AiProvider) => void;
}) {
  const [form, setForm] = useState<ProviderFormFields>({
    ...defaultForm,
    name: initial?.name ?? '',
    base_url: initial?.base_url ?? '',
    models_fetch_endpoint: initial?.models_fetch_endpoint ?? '/v1/models',
    generate_endpoint: initial?.generate_endpoint ?? '/v1/chat/completions',
    test_endpoint: initial?.test_endpoint ?? '/v1/models',
    auth_header_format: initial?.auth_header_format ?? 'Bearer {KEY}',
    payload_format: initial?.payload_format ?? 'openai',
    api_key: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        base_url: form.base_url,
        models_fetch_endpoint: form.models_fetch_endpoint,
        generate_endpoint: form.generate_endpoint,
        test_endpoint: form.test_endpoint,
        auth_header_format: form.auth_header_format,
        payload_format: form.payload_format,
        is_active: initial?.is_active ?? true,
        ...(form.api_key ? { api_key: form.api_key } : {}),
      };

      let provider: AiProvider;
      if (mode === 'edit' && initial) {
        const res = await aiProvidersApi.update(initial.id, payload);
        provider = res.data.data;
      } else {
        const res = await aiProvidersApi.create(payload);
        provider = res.data.data;
      }
      onSaved(provider);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? `Failed to ${mode === 'edit' ? 'update' : 'create'} provider`);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Fixed header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {isEdit ? <Edit2 className="w-5 h-5 text-nexus-blue" /> : <Globe className="w-5 h-5 text-nexus-blue" />}
            {isEdit ? 'Edit AI Provider' : 'Add AI Provider'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Payload Format Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Payload Format</label>
            <select
              value={form.payload_format}
              onChange={(e) => setForm((prev) => ({ ...prev, payload_format: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-blue/50 transition-colors"
            >
              {PAYLOAD_FORMATS.map((f) => (
                <option key={f} value={f} className="bg-[#0d1117]">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-600">
              Determines how requests/responses are structured when communicating with this provider.
            </p>
          </div>

          {/* Text fields */}
          {TEXT_FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.key === 'api_key' ? 'password' : 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-nexus-blue/50 transition-colors"
                required={['name', 'base_url'].includes(f.key)}
                autoComplete={f.key === 'api_key' ? 'new-password' : 'off'}
              />
              {isEdit && f.key === 'api_key' && (
                <p className="text-[10px] text-gray-600">Leave blank to keep the existing API key.</p>
              )}
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Fixed footer buttons inside form */}
          <div className="flex gap-3 pt-2 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-nexus-blue hover:bg-nexus-blue/80 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              {loading ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create & Sync'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteConfirmModal({
  provider,
  onClose,
  onDeleted,
}: {
  provider: AiProvider;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await aiProvidersApi.delete(provider.id);
      onDeleted(provider.id);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to delete provider');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" /> Delete Provider
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-300">
            Are you sure you want to delete <span className="font-semibold text-white">{provider.name}</span>?
            This will also remove all associated models and API keys. This action cannot be undone.
          </p>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  onTest,
  onSyncModels,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  provider: ProviderWithState;
  onTest: (id: string) => void;
  onSyncModels: (id: string) => void;
  onEdit: (provider: AiProvider) => void;
  onDelete: (provider: AiProvider) => void;
  onToggleActive: (id: string, current: boolean) => void;
}) {
  const [modelsExpanded, setModelsExpanded] = useState(false);
  const CHIP_LIMIT = 6;

  const visibleModels = modelsExpanded
    ? provider.syncedModels
    : provider.syncedModels.slice(0, CHIP_LIMIT);

  const hasMore = provider.syncedModels.length > CHIP_LIMIT;

  return (
    <NxGlassCard className="p-5 flex flex-col gap-4 hover:border-nexus-blue/20 transition-all duration-300">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 border border-white/5 rounded text-gray-400 truncate block max-w-[240px]">
            {provider.base_url}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-lg font-semibold text-gray-100 tracking-tight">{provider.name}</h3>
            {provider.payload_format && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-nexus-blue/10 border border-nexus-blue/20 text-nexus-blue">
                {provider.payload_format}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <NxStatusBadge status={provider.is_active ? 'success' : 'neutral'} label={provider.is_active ? 'ACTIVE' : 'INACTIVE'} dot />
          {/* Active/Inactive toggle */}
          <button
            onClick={() => onToggleActive(provider.id, provider.is_active)}
            className={`p-1.5 rounded-lg transition-all ${provider.is_active ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
            title={provider.is_active ? 'Deactivate provider' : 'Activate provider'}
          >
            {provider.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          {/* Edit & Delete icon buttons */}
          <button
            onClick={() => onEdit(provider)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-nexus-blue hover:bg-nexus-blue/10 transition-all"
            title="Edit provider"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(provider)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete provider"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
        {[
          { label: 'Models Endpoint', value: provider.models_fetch_endpoint },
          { label: 'Generate Endpoint', value: provider.generate_endpoint },
          { label: 'Auth Format', value: provider.auth_header_format },
          { label: 'Latency', value: provider.testState === 'success' ? `${provider.latency ?? '—'}ms` : '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="block text-[9px] uppercase font-bold text-gray-600 tracking-wider mb-0.5">{label}</span>
            <code className={provider.testState === 'success' && label === 'Latency' ? 'text-green-400' : 'text-gray-400'}>
              {value || '—'}
            </code>
          </div>
        ))}
      </div>

      {/* Model count summary */}
      {provider.syncedModels.length > 0 && (
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Database className="w-3.5 h-3.5" />
            <span><strong className="text-gray-300">{provider.syncedModels.length}</strong> model{provider.syncedModels.length !== 1 ? 's' : ''} synced</span>
          </div>
          {provider.last_synced_at && (
            <span className="text-gray-600 text-[10px]">
              Last sync: {new Date(provider.last_synced_at).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Synced models chips — collapsible */}
      {provider.syncedModels.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {visibleModels.map((m) => (
              <span key={m.id} className="text-[10px] bg-nexus-blue/10 border border-nexus-blue/20 px-2 py-0.5 rounded text-nexus-blue font-mono" title={m.description ?? undefined}>
                {m.name}
              </span>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setModelsExpanded((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors w-fit"
            >
              {modelsExpanded ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> +{provider.syncedModels.length - CHIP_LIMIT} more models</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="border-t border-white/5 pt-4 -mx-5 -mb-5 px-5 py-4 bg-black/10 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {provider.testState === 'testing' && <Loader2 className="w-4 h-4 animate-spin text-nexus-blue" />}
          {provider.testState === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
          {provider.testState === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}

          {/* Sync state indicator */}
          {provider.syncState === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
          {provider.syncState === 'done' && <CheckCircle className="w-4 h-4 text-nexus-blue" />}
          {provider.syncState === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}

          <span className="text-xs text-gray-500">
            {provider.testState === 'testing' ? 'Pinging...'
              : provider.testState === 'success' ? 'Connected'
              : provider.testState === 'failed' ? 'Unreachable'
              : provider.syncState === 'syncing' ? 'Syncing models...'
              : provider.syncState === 'done' ? 'Models synced'
              : provider.syncState === 'error' ? 'Sync failed'
              : 'Not tested'}
          </span>
        </div>
        <div className="flex gap-2">
          <NxActionButton
            variant="secondary"
            size="sm"
            onClick={() => onSyncModels(provider.id)}
            isLoading={provider.syncState === 'syncing'}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Models
          </NxActionButton>
          <NxActionButton
            variant="primary"
            size="sm"
            onClick={() => onTest(provider.id)}
            isLoading={provider.testState === 'testing'}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Ping
          </NxActionButton>
        </div>
      </div>
    </NxGlassCard>
  );
}

// ─── Health Panel ──────────────────────────────────────────────────────────────
function HealthPanel() {
  const [scorecard, setScorecard] = useState<Record<string, ProviderHealthRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    aiHealthApi.getScorecard()
      .then((res) => setScorecard(res.data.data ?? {}))
      .catch(() => { setError(true); setScorecard({}); })
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => s === 'healthy' ? 'text-green-400' : s === 'degraded' ? 'text-yellow-400' : 'text-red-400';
  const statusBg = (s: string) => s === 'healthy' ? 'bg-green-400/10 border-green-400/20' : s === 'degraded' ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20';

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading health data...</div>;

  if (error) return (
    <NxEmptyState
      icon={<AlertTriangle className="w-10 h-10 text-yellow-600" />}
      title="Health Data Unavailable"
      description="Could not load provider health scorecard. Ensure the scheduler is running."
    />
  );

  const entries = Object.entries(scorecard ?? {});

  if (entries.length === 0) {
    return (
      <NxEmptyState
        icon={<Activity className="w-10 h-10 text-gray-600" />}
        title="No Health Data Yet"
        description="Health data will appear after the first polling cycle (every 5 minutes). Make sure the scheduler is running."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-400">Live provider health scorecard — updated every 5 minutes by the scheduler.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(([providerId, record]) => (
          <NxGlassCard key={providerId} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500">{providerId.slice(0, 8)}…</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusBg(record.status)} ${statusColor(record.status)}`}>
                {record.status.toUpperCase()}
              </span>
            </div>
            <div className="text-3xl font-bold text-white">{Math.round(record.avg_latency ?? 0)}<span className="text-sm font-normal text-gray-400 ml-1">ms avg</span></div>
            <div className="text-xs text-gray-500">Average latency over the last hour</div>
          </NxGlassCard>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics Panel ───────────────────────────────────────────────────────────
function AnalyticsPanel() {
  const [forecast, setForecast] = useState<CostForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    aiCostApi.getForecast()
      .then((res) => setForecast(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    try {
      await aiCostApi.setBudget(val);
      setBudgetInput('');
      setSaveMsg('Budget updated!');
      load();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const statusIcon = forecast?.status === 'budget_exceeded'
    ? <AlertTriangle className="w-5 h-5 text-red-400" />
    : forecast?.status === 'over_budget_predicted'
    ? <TrendingUp className="w-5 h-5 text-yellow-400" />
    : <CheckCircle className="w-5 h-5 text-green-400" />;

  const pct = forecast && forecast.monthly_limit > 0
    ? Math.min(100, (forecast.current_spend / forecast.monthly_limit) * 100)
    : 0;

  const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading analytics...</div>;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-400">Real-time cost tracking and monthly budget forecast.</p>

      {forecast && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          forecast.status === 'budget_exceeded' ? 'bg-red-500/10 border-red-500/20' :
          forecast.status === 'over_budget_predicted' ? 'bg-yellow-500/10 border-yellow-500/20' :
          'bg-green-500/10 border-green-500/20'
        }`}>
          {statusIcon}
          <span className="text-sm font-medium text-white">
            {forecast.status === 'budget_exceeded' ? 'Budget Exceeded — requests may be blocked' :
             forecast.status === 'over_budget_predicted' ? 'On track to exceed budget this month' :
             'Budget on track'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Spend', value: `$${(forecast?.current_spend ?? 0).toFixed(4)}`, icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Monthly Limit', value: forecast?.monthly_limit ? `$${forecast.monthly_limit.toFixed(2)}` : 'Not set', icon: <ShieldCheck className="w-4 h-4" /> },
          { label: 'Remaining', value: `$${(forecast?.remaining_budget ?? 0).toFixed(4)}`, icon: <Info className="w-4 h-4" /> },
          { label: 'Forecasted Total', value: `$${(forecast?.forecasted_total ?? 0).toFixed(4)}`, icon: <TrendingUp className="w-4 h-4" /> },
        ].map(({ label, value, icon }) => (
          <NxGlassCard key={label} className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-400">{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
            <div className="text-xl font-bold text-white">{value}</div>
          </NxGlassCard>
        ))}
      </div>

      {forecast && forecast.monthly_limit > 0 && (
        <NxGlassCard className="p-5 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Budget Used</span>
            <span className="text-white font-bold">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-gray-500">${(forecast.current_spend).toFixed(4)} of ${forecast.monthly_limit.toFixed(2)}</div>
        </NxGlassCard>
      )}

      <NxGlassCard className="p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-200">Set Monthly Budget Limit</h3>
        {saveMsg && <p className="text-xs text-green-400">{saveMsg}</p>}
        <div className="flex gap-3">
          <input
            type="number" step="0.01" min="0"
            placeholder="e.g. 50.00"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-nexus-blue/50"
          />
          <NxActionButton variant="primary" size="sm" onClick={saveBudget} isLoading={saving} leftIcon={<CheckCircle className="w-4 h-4" />}>
            Save Budget
          </NxActionButton>
        </div>
      </NxGlassCard>
    </div>
  );
}

// ─── Audit Trail Panel ─────────────────────────────────────────────────────────
function AuditTrailPanel() {
  const [entries, setEntries] = useState<AiAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'fallback'>('all');

  useEffect(() => {
    aiAuditApi.list({ limit: 100 })
      .then((res) => setEntries(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    if (filter === 'success') return e.status === 'success';
    if (filter === 'failed') return e.status === 'failed';
    if (filter === 'fallback') return e.fallback_triggered;
    return true;
  });

  const statusColor = (s: string) => s === 'success' ? 'text-green-400' : s === 'failed' ? 'text-red-400' : 'text-yellow-400';

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading audit trail...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-400">Full audit log of AI routing executions, fallbacks, and errors.</p>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['all', 'success', 'failed', 'fallback'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? 'bg-nexus-blue text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {f === 'all' ? 'All' : f === 'success' ? 'Success' : f === 'failed' ? 'Failed' : 'Fallbacks'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <NxEmptyState icon={<ClipboardList className="w-10 h-10 text-gray-600" />} title="No Audit Entries" description="Audit entries will appear after the first routed request." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => (
            <NxGlassCard key={entry.id} className="p-4 flex items-center gap-4">
              <div className="shrink-0 w-2 h-2 rounded-full mt-0.5" style={{ background: entry.status === 'success' ? '#4ade80' : entry.status === 'failed' ? '#f87171' : '#facc15' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-300">{entry.intent ?? '—'}</span>
                  {entry.fallback_triggered && <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">FALLBACK</span>}
                  {entry.error_type && <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded truncate max-w-[160px]">{entry.error_type}</span>}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{new Date(entry.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xs font-bold ${statusColor(entry.status)}`}>{entry.status.toUpperCase()}</div>
                <div className="text-[11px] text-gray-500">{entry.latency_ms}ms</div>
              </div>
            </NxGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Intent Routing Panel ──────────────────────────────────────────────────────
function IntentRoutingPanel({ addToast }: { addToast: (type: 'success' | 'error', msg: string) => void }) {
  type MatrixData = {
    intents: { id: string; name: string }[];
    providers: { id: string; name: string; models: { id: string; name: string }[] }[];
    routes: IntentRoute[];
  };
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  // keyed by intent name → local route state
  const [localRoutes, setLocalRoutes] = useState<Record<string, IntentRoute>>({});

  useEffect(() => {
    intentRoutingApi.getMatrix().then((res) => {
      const data = res.data.data;
      setMatrix(data);
      const routeMap: Record<string, IntentRoute> = {};
      // Routes from API use `intent` as the key field — normalise here
      data.routes.forEach((r) => {
        const key = r.intent ?? (r as unknown as Record<string, string>)['intent_name'] ?? '';
        if (key) routeMap[key] = { ...r, intent: key };
      });
      setLocalRoutes(routeMap);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveRoute = async (intentName: string) => {
    const route = localRoutes[intentName];
    if (!route || !route.provider) {
      addToast('error', 'Select a provider before saving.');
      return;
    }
    setSaving(intentName);
    try {
      await intentRoutingApi.updateRoute({
        intent: intentName,
        provider: route.provider,
        model: route.model,
        fallbackProvider: route.fallbackProvider,
        fallbackModel: route.fallbackModel,
      });
      addToast('success', `Route saved for "${intentName.replace(/_/g, ' ')}"`);
    } catch {
      addToast('error', `Failed to save route for "${intentName}"`);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading routing matrix...</div>;
  if (!matrix || matrix.intents.length === 0) return <NxEmptyState icon={<Settings2 className="w-10 h-10 text-gray-600" />} title="No Intents Configured" description="Intent routing will appear once providers and models are active." />;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-400">Map each system intent to a specific AI provider and model.</p>
      {matrix.intents.map((intent) => {
        const intentName = intent.name;
        const route = localRoutes[intentName] ?? { intent: intentName, provider: '', model: '' };
        const providerModels = matrix.providers.find((p) => p.id === route.provider)?.models ?? [];
        return (
          <NxGlassCard key={intent.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-nexus-blue" />
                <span className="text-sm font-semibold text-gray-200 capitalize">{intentName.replace(/_/g, ' ')}</span>
                {route.provider && route.model && (
                  <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                    Configured
                  </span>
                )}
              </div>
              <button
                onClick={() => saveRoute(intentName)}
                disabled={saving === intentName}
                className="text-xs px-3 py-1 rounded-lg bg-nexus-blue/20 border border-nexus-blue/30 text-nexus-blue hover:bg-nexus-blue/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving === intentName ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Save
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Provider</label>
                <select
                  value={route.provider}
                  onChange={(e) => setLocalRoutes((prev) => ({ ...prev, [intentName]: { ...route, provider: e.target.value, model: '' } }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-blue/50"
                >
                  <option value="" className="bg-[#0d1117]">— Select Provider —</option>
                  {matrix.providers.map((p) => <option key={p.id} value={p.id} className="bg-[#0d1117]">{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Model</label>
                <select
                  value={route.model}
                  onChange={(e) => setLocalRoutes((prev) => ({ ...prev, [intentName]: { ...route, model: e.target.value } }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-blue/50"
                  disabled={!route.provider}
                >
                  <option value="" className="bg-[#0d1117]">— Select Model —</option>
                  {providerModels.map((m) => <option key={m.id} value={m.id} className="bg-[#0d1117]">{m.name}</option>)}
                </select>
              </div>
            </div>
          </NxGlassCard>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AIModelsPage() {
  const [providers, setProviders] = useState<ProviderWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AiProvider | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AiProvider | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('providers');
  const { toasts, addToast, dismiss } = useToast();

  const toProviderWithState = (p: AiProvider): ProviderWithState => ({
    ...p,
    testState: 'idle',
    syncState: 'idle',
    syncedModels: p.models ?? [],
  });

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiProvidersApi.list();
      // Backend returns { success: true, data: AiProvider[] }
      const data: AiProvider[] = res.data.data ?? [];
      setProviders(data.map(toProviderWithState));
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchProviders(); }, [fetchProviders]);

  const testProvider = async (id: string) => {
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, testState: 'testing' } : p));
    const start = Date.now();
    try {
      const res = await aiProvidersApi.test(id);
      const latency = Date.now() - start;
      const succeeded = res.data.success;
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, testState: succeeded ? 'success' : 'failed', latency } : p));
      if (succeeded) addToast('success', 'Provider connection verified.');
      else addToast('error', 'Provider ping failed.');
    } catch {
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, testState: 'failed' } : p));
      addToast('error', 'Provider ping failed.');
    }
  };

  const syncModels = async (id: string) => {
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, syncState: 'syncing' } : p));
    try {
      const res = await aiProvidersApi.syncModels(id);
      const models = res.data.data ?? [];
      const count = res.data.synced_count ?? models.length;
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, syncState: 'done', syncedModels: models } : p
        )
      );
      addToast('success', `Synced ${count} model${count !== 1 ? 's' : ''} successfully.`);
    } catch (err: unknown) {
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, syncState: 'error' } : p));
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to sync models.';
      addToast('error', msg);
    }
    // Reset sync state after 4s
    setTimeout(() => {
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, syncState: 'idle' } : p));
    }, 4000);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const newActive = !currentActive;
    try {
      const res = await aiProvidersApi.toggleActive(id, newActive);
      const updated = res.data.data;
      setProviders((prev) => prev.map((p) => p.id === id
        ? { ...p, ...updated, syncedModels: updated.models ?? p.syncedModels, testState: p.testState, syncState: p.syncState }
        : p
      ));
      addToast('success', `Provider ${newActive ? 'activated' : 'deactivated'}.`);
    } catch {
      addToast('error', 'Failed to toggle provider status.');
    }
  };

  /** Called when a provider is saved (Add or Edit) */
  const handleProviderSaved = (saved: AiProvider) => {
    setProviders((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      const withState: ProviderWithState = toProviderWithState(saved);
      if (exists) {
        return prev.map((p) => p.id === saved.id ? { ...withState, testState: p.testState, syncState: p.syncState } : p);
      }
      return [...prev, withState];
    });
    setShowAddModal(false);
    setEditTarget(null);
    addToast('success', `Provider "${saved.name}" ${editTarget ? 'updated' : 'created'} successfully.`);
  };

  /** Called when a provider is deleted */
  const handleProviderDeleted = (id: string) => {
    const p = providers.find((x) => x.id === id);
    setProviders((prev) => prev.filter((x) => x.id !== id));
    setDeleteTarget(null);
    addToast('success', `Provider "${p?.name ?? ''}" deleted.`);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'providers', label: 'Providers & Models', icon: <Server className="w-3.5 h-3.5" /> },
    { key: 'routing', label: 'Intent Routing', icon: <Settings2 className="w-3.5 h-3.5" /> },
    { key: 'health', label: 'Health', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'analytics', label: 'Analytics', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { key: 'audit', label: 'Audit Trail', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  ];

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-nexus-blue animate-pulse" /> AI Model Gateway
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage AI providers, routing profiles, health monitoring, and cost analytics.</p>
          </div>
          {activeTab === 'providers' && (
            <div className="flex gap-2 shrink-0">
              <NxActionButton
                variant="secondary"
                size="sm"
                onClick={() => providers.forEach((p) => testProvider(p.id))}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Verify All
              </NxActionButton>
              <NxActionButton
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Add Provider
              </NxActionButton>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit flex-wrap">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === key ? 'bg-nexus-blue text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'providers' && (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => <GridCardSkeleton key={i} />)}
            </div>
          ) : providers.length === 0 ? (
            <NxEmptyState
              icon={<Server className="w-10 h-10 text-gray-600" />}
              title="No AI Providers Configured"
              description="Add your first provider to start routing AI tasks dynamically."
              action={<NxActionButton variant="primary" size="sm" onClick={() => setShowAddModal(true)}>Add First Provider</NxActionButton>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onTest={testProvider}
                  onSyncModels={syncModels}
                  onEdit={(prov) => setEditTarget(prov)}
                  onDelete={(prov) => setDeleteTarget(prov)}
                  onToggleActive={toggleActive}
                />
              ))}
            </div>
          )
        )}
        {activeTab === 'routing' && <IntentRoutingPanel addToast={addToast} />}
        {activeTab === 'health' && <HealthPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'audit' && <AuditTrailPanel />}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <ProviderFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSaved={handleProviderSaved}
        />
      )}

      {/* Edit Provider Modal */}
      {editTarget && (
        <ProviderFormModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleProviderSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          provider={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleProviderDeleted}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AppLayout>
  );
}
