"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxStatusBadge } from '@/components/NxStatusBadge';
import {
  Bot,
  Brain,
  Clock,
  Zap,
  PlusCircle,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Trash2,
  ScrollText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ecaRulesApi, proactiveTriggersApi, autonomousLogsApi, EcaRule, ProactiveTrigger, AutonomousLog } from '@/lib/api/ai-models';

// ─── Add Rule Modal ────────────────────────────────────────────────────────────
function AddRuleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: EcaRule) => void }) {
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examples = [
    "If Mohamed contacts me regarding payment, reply with 'Will get back to you shortly', then notify me.",
    "Remind me tomorrow at 9 AM about the team meeting.",
    "When a contact messages me about a refund, notify me immediately.",
    "Send a follow-up to Ahmed next Monday at 10 AM.",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguage.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await ecaRulesApi.create({
        name: naturalLanguage.substring(0, 60),
        natural_language_rule: naturalLanguage,
        is_active: true,
      });
      onCreated(res.data.data);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            New Autonomous Rule
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
              Natural Language Rule
            </label>
            <textarea
              value={naturalLanguage}
              onChange={(e) => setNaturalLanguage(e.target.value)}
              placeholder="e.g. If Mohamed contacts me about X, reply with Y and notify me."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              required
            />
          </div>

          {/* Examples */}
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-2">Quick Examples</p>
            <div className="flex flex-col gap-1.5">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNaturalLanguage(ex)}
                  className="text-left text-xs text-gray-400 hover:text-purple-300 bg-white/3 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 rounded-lg px-3 py-2 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !naturalLanguage.trim()}
              className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {loading ? 'Processing...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <NxGlassCard className="p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </NxGlassCard>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProactiveAIPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'triggers' | 'logs'>('rules');
  const [rules, setRules] = useState<EcaRule[]>([]);
  const [triggers, setTriggers] = useState<ProactiveTrigger[]>([]);
  const [logs, setLogs] = useState<AutonomousLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, triggersRes, logsRes] = await Promise.allSettled([
        ecaRulesApi.list(),
        proactiveTriggersApi.list(),
        autonomousLogsApi.list(),
      ]);
      if (rulesRes.status === 'fulfilled') {
        setRules(rulesRes.value.data.data ?? []);
      }
      if (triggersRes.status === 'fulfilled') {
        setTriggers(triggersRes.value.data.data ?? []);
      }
      if (logsRes.status === 'fulfilled') {
        setLogs(logsRes.value.data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };
    void load();
  }, [fetchAll]);

  const toggleRule = async (id: number) => {
    try {
      await ecaRulesApi.toggle(id);
      setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !r.is_active } : r));
    } catch { /* silent */ }
  };

  const deleteRule = async (id: number) => {
    try {
      await ecaRulesApi.delete(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch { /* silent */ }
  };

  const activeRules = rules.filter((r) => r.is_active).length;
  const pendingTriggers = triggers.filter((t) => t.status === 'pending').length;
  const completedLogs = logs.filter((l) => l.status === 'completed').length;

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
              Proactive AI Engine
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Souly acts autonomously — define rules in plain language and she executes them on your behalf.
            </p>
          </div>
          <NxActionButton
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            New Rule
          </NxActionButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Rules" value={rules.length} icon={<Brain className="w-5 h-5 text-purple-400" />} color="bg-purple-500/10" />
          <StatCard label="Active Rules" value={activeRules} icon={<Play className="w-5 h-5 text-green-400" />} color="bg-green-500/10" />
          <StatCard label="Pending Triggers" value={pendingTriggers} icon={<Clock className="w-5 h-5 text-yellow-400" />} color="bg-yellow-500/10" />
          <StatCard label="Actions Completed" value={completedLogs} icon={<CheckCircle className="w-5 h-5 text-nexus-blue" />} color="bg-nexus-blue/10" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {(['rules', 'triggers', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'rules' ? 'ECA Rules' : tab === 'triggers' ? 'Scheduled Triggers' : 'Action Logs'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            {/* Rules Tab */}
            {activeTab === 'rules' && (
              rules.length === 0 ? (
                <NxEmptyState
                  icon={<Brain className="w-10 h-10 text-gray-600" />}
                  title="No Autonomous Rules Yet"
                  description="Type a rule in plain language. Souly will parse it and execute it at the right moment."
                  action={
                    <NxActionButton variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                      Create First Rule
                    </NxActionButton>
                  }
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {rules.map((rule) => (
                    <NxGlassCard key={rule.id} className={`p-4 border transition-all ${rule.is_active ? 'border-purple-500/20' : 'border-white/5 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${rule.is_active ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 leading-relaxed">{rule.natural_language_rule}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {rule.event_type && (
                                <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono">
                                  {rule.event_type}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-500">
                                Created {rule.created_at ? new Date(rule.created_at).toLocaleDateString() : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <NxStatusBadge
                            status={rule.is_active ? 'success' : 'neutral'}
                            label={rule.is_active ? 'ACTIVE' : 'PAUSED'}
                            dot
                          />
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            title={rule.is_active ? 'Pause' : 'Resume'}
                          >
                            {rule.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </NxGlassCard>
                  ))}
                </div>
              )
            )}

            {/* Triggers Tab */}
            {activeTab === 'triggers' && (
              triggers.length === 0 ? (
                <NxEmptyState
                  icon={<Clock className="w-10 h-10 text-gray-600" />}
                  title="No Scheduled Triggers"
                  description="When rules with time-based conditions are created, scheduled triggers will appear here."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {triggers.map((t) => (
                    <NxGlassCard key={t.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                        <div>
                          <p className="text-sm text-gray-200 capitalize">{t.trigger_type.replace(/_/g, ' ')} trigger</p>
                          {t.next_run_at && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Scheduled: {new Date(t.next_run_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <NxStatusBadge
                        status={t.status === 'completed' ? 'success' : t.status === 'failed' ? 'danger' : 'warning'}
                        label={t.status.toUpperCase()}
                        dot
                      />
                    </NxGlassCard>
                  ))}
                </div>
              )
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              logs.length === 0 ? (
                <NxEmptyState
                  icon={<ScrollText className="w-10 h-10 text-gray-600" />}
                  title="No Autonomous Actions Yet"
                  description="Completed actions by Souly will appear here with full reasoning traces."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {logs.map((log) => (
                    <NxGlassCard key={log.id} className="p-4 flex items-start gap-4">
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {log.status === 'completed'
                          ? <CheckCircle className="w-4 h-4 text-green-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200">{log.action_taken}</p>
                        {log.reasoning && (
                          <p className="text-xs text-gray-500 mt-1 italic">{log.reasoning}</p>
                        )}
                        <p className="text-[10px] text-gray-600 mt-1.5">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </p>
                      </div>
                      <NxStatusBadge
                        status={log.status === 'completed' ? 'success' : 'danger'}
                        label={log.status.toUpperCase()}
                      />
                    </NxGlassCard>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <AddRuleModal
          onClose={() => setShowAddModal(false)}
          onCreated={(r) => {
            setRules((prev) => [r, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </AppLayout>
  );
}
