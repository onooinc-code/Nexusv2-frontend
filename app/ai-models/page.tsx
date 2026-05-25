"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxStatusBadge } from '@/components/NxStatusBadge';
import {
  Sparkles,
  RefreshCw,
  PlusCircle,
  Zap,
  Server,
  Globe,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { aiProvidersApi, aiModelsApi, AiProvider, AiModel } from '@/lib/api/ai-models';

type TestState = 'idle' | 'testing' | 'success' | 'failed';

interface ProviderWithState extends AiProvider {
  testState: TestState;
  latency?: number;
  syncedModels?: AiModel[];
}

// ─── Add Provider Modal ────────────────────────────────────────────────────────
function AddProviderModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: AiProvider) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    base_url: '',
    models_fetch_endpoint: '/v1/models',
    generate_endpoint: '/v1/chat/completions',
    test_endpoint: '/v1/models',
    auth_header_format: 'Bearer {KEY}',
    api_key: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await aiProvidersApi.create({
        name: form.name,
        base_url: form.base_url,
        models_fetch_endpoint: form.models_fetch_endpoint,
        generate_endpoint: form.generate_endpoint,
        test_endpoint: form.test_endpoint,
        auth_header_format: form.auth_header_format,
        is_active: true,
      });
      onCreated(res.data.data);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to create provider');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Provider Name', placeholder: 'e.g. OpenAI, Groq, Ollama' },
    { key: 'base_url', label: 'Base URL', placeholder: 'https://api.openai.com' },
    { key: 'models_fetch_endpoint', label: 'Models Endpoint', placeholder: '/v1/models' },
    { key: 'generate_endpoint', label: 'Generate Endpoint', placeholder: '/v1/chat/completions' },
    { key: 'test_endpoint', label: 'Test Endpoint', placeholder: '/v1/models' },
    { key: 'auth_header_format', label: 'Auth Header Format', placeholder: 'Bearer {KEY}' },
    { key: 'api_key', label: 'API Key', placeholder: 'sk-...' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-nexus-blue" />
            Add AI Provider
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.key === 'api_key' ? 'password' : 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-nexus-blue/50 transition-colors"
                required={['name', 'base_url'].includes(f.key)}
              />
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  onTest,
  onSyncModels,
}: {
  provider: ProviderWithState;
  onTest: (id: string) => void;
  onSyncModels: (id: string) => void;
}) {
  return (
    <NxGlassCard className="p-5 flex flex-col gap-4 hover:border-nexus-blue/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 border border-white/5 rounded text-gray-400">
            {provider.base_url}
          </span>
          <h3 className="text-lg font-semibold text-gray-100 mt-2 tracking-tight">{provider.name}</h3>
        </div>
        <NxStatusBadge
          status={provider.is_active ? 'success' : 'neutral'}
          label={provider.is_active ? 'ACTIVE' : 'INACTIVE'}
          dot
        />
      </div>

      {/* Endpoints */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600 tracking-wider mb-0.5">Models Endpoint</span>
          <code className="text-gray-400">{provider.models_fetch_endpoint || '—'}</code>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600 tracking-wider mb-0.5">Generate Endpoint</span>
          <code className="text-gray-400">{provider.generate_endpoint || '—'}</code>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600 tracking-wider mb-0.5">Auth Format</span>
          <code className="text-gray-400">{provider.auth_header_format || '—'}</code>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600 tracking-wider mb-0.5">Latency</span>
          <code className={`${provider.testState === 'success' ? 'text-green-400' : 'text-gray-400'}`}>
            {provider.testState === 'success' ? `${provider.latency ?? '—'}ms` : '—'}
          </code>
        </div>
      </div>

      {/* Synced Models */}
      {provider.syncedModels && provider.syncedModels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {provider.syncedModels.slice(0, 5).map((m) => (
            <span key={m.id} className="text-[10px] bg-nexus-blue/10 border border-nexus-blue/20 px-2 py-0.5 rounded text-nexus-blue font-mono">
              {m.name}
            </span>
          ))}
          {provider.syncedModels.length > 5 && (
            <span className="text-[10px] text-gray-500">+{provider.syncedModels.length - 5} more</span>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-white/5 pt-4 -mx-5 -mb-5 px-5 py-4 bg-black/10 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {provider.testState === 'testing' && <Loader2 className="w-4 h-4 animate-spin text-nexus-blue" />}
          {provider.testState === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
          {provider.testState === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
          <span className="text-xs text-gray-500">
            {provider.testState === 'testing' ? 'Pinging...' :
             provider.testState === 'success' ? 'Connected' :
             provider.testState === 'failed' ? 'Unreachable' : 'Not tested'}
          </span>
        </div>
        <div className="flex gap-2">
          <NxActionButton
            variant="secondary"
            size="sm"
            onClick={() => onSyncModels(provider.id)}
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AIModelsPage() {
  const [providers, setProviders] = useState<ProviderWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'routing'>('providers');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiProvidersApi.list();
      const data = Array.isArray(res.data) ? res.data : (res.data as { data?: AiProvider[] })?.data ?? [];
      setProviders(data.map((p: AiProvider) => ({ ...p, testState: 'idle' as TestState })));
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const testProvider = async (id: string) => {
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, testState: 'testing' } : p));
    const start = Date.now();
    try {
      const res = await aiProvidersApi.test(id);
      const latency = Date.now() - start;
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, testState: res.data.success ? 'success' : 'failed', latency } : p
        )
      );
    } catch {
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, testState: 'failed' } : p));
    }
  };

  const syncModels = async (id: string) => {
    try {
      const res = await aiProvidersApi.syncModels(id);
      const models = res.data.data ?? [];
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, syncedModels: models } : p));
    } catch {
      // silent
    }
  };

  const testAll = () => providers.forEach((p) => testProvider(p.id));

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-nexus-blue animate-pulse" />
              AI Model Gateway
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Dynamically manage AI providers, sync models from live endpoints, and verify connections.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <NxActionButton variant="secondary" size="sm" onClick={testAll} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Verify All
            </NxActionButton>
            <NxActionButton variant="primary" size="sm" onClick={() => setShowAddModal(true)} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Provider
            </NxActionButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {(['providers', 'routing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-nexus-blue text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'providers' ? 'Providers & Models' : 'Intent Routing'}
            </button>
          ))}
        </div>

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading providers...
              </div>
            ) : providers.length === 0 ? (
              <NxEmptyState
                icon={<Server className="w-10 h-10 text-gray-600" />}
                title="No AI Providers Configured"
                description="Add your first provider to start routing AI tasks dynamically."
                action={
                  <NxActionButton variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                    Add First Provider
                  </NxActionButton>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} onTest={testProvider} onSyncModels={syncModels} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Routing Tab */}
        {activeTab === 'routing' && <IntentRoutingPanel />}

      </div>

      {showAddModal && (
        <AddProviderModal
          onClose={() => setShowAddModal(false)}
          onCreated={(p) => {
            setProviders((prev) => [...prev, { ...p, testState: 'idle' }]);
            setShowAddModal(false);
          }}
        />
      )}
    </AppLayout>
  );
}

// ─── Intent Routing Sub-Panel ──────────────────────────────────────────────────
import { intentRoutingApi, IntentRoute } from '@/lib/api/ai-models';

function IntentRoutingPanel() {
  const [matrix, setMatrix] = useState<{
    intents: { id: string; name: string }[];
    providers: { id: string; name: string; models: { id: string; name: string }[] }[];
    routes: IntentRoute[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localRoutes, setLocalRoutes] = useState<Record<string, IntentRoute>>({});

  useEffect(() => {
    intentRoutingApi.getMatrix().then((res) => {
      const data = res.data.data;
      setMatrix(data);
      const routeMap: Record<string, IntentRoute> = {};
      data.routes.forEach((r) => { routeMap[r.intent] = r; });
      setLocalRoutes(routeMap);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveRoute = async (intent: string) => {
    const route = localRoutes[intent];
    if (!route) return;
    setSaving(intent);
    try {
      await intentRoutingApi.updateRoute(route);
    } catch { /* silent */ } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading routing matrix...
      </div>
    );
  }

  if (!matrix || matrix.intents.length === 0) {
    return (
      <NxEmptyState
        icon={<Settings2 className="w-10 h-10 text-gray-600" />}
        title="No Intents Configured"
        description="Intent routing will appear once providers and models are active."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-400">Map each system intent to a specific AI provider and model.</p>
      {matrix.intents.map((intent) => {
        const route = localRoutes[intent.name] ?? { intent: intent.name, provider: '', model: '' };
        const providerModels = matrix.providers.find((p) => p.id === route.provider)?.models ?? [];
        return (
          <NxGlassCard key={intent.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-nexus-blue" />
                <span className="text-sm font-semibold text-gray-200 capitalize">{intent.name.replace(/_/g, ' ')}</span>
              </div>
              <button
                onClick={() => saveRoute(intent.name)}
                disabled={saving === intent.name}
                className="text-xs px-3 py-1 rounded-lg bg-nexus-blue/20 border border-nexus-blue/30 text-nexus-blue hover:bg-nexus-blue/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving === intent.name ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Save
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Provider</label>
                <select
                  value={route.provider}
                  onChange={(e) =>
                    setLocalRoutes((prev) => ({
                      ...prev,
                      [intent.name]: { ...route, provider: e.target.value, model: '' },
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-blue/50"
                >
                  <option value="">— Select Provider —</option>
                  {matrix.providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Model</label>
                <select
                  value={route.model}
                  onChange={(e) =>
                    setLocalRoutes((prev) => ({
                      ...prev,
                      [intent.name]: { ...route, model: e.target.value },
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-blue/50"
                  disabled={!route.provider}
                >
                  <option value="">— Select Model —</option>
                  {providerModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </NxGlassCard>
        );
      })}
    </div>
  );
}
