"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxSwitch } from '@/components/NxSwitch';
import { NxSlider } from '@/components/NxSlider';
import { NxActionButton } from '@/components/NxActionButton';
import { NxInput } from '@/components/NxInput';
import { Settings, Trash2, Database, Cpu, ShieldAlert, Check, RefreshCw, AlertTriangle, Zap, Shield, Eye, EyeOff, Loader, ActivitySquare } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ApiTesterPanel } from './components/ApiTesterPanel';

interface SettingEntry {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  group: string;
  description?: string;
  is_public: boolean;
  is_encrypted: boolean;
}

type GroupedSettings = Record<string, SettingEntry[]>;

type TabType = 'general' | 'integrations' | 'health' | 'api-tester' | 'seeds' | 'advanced';

interface HealthStatus {
  status: string;
  checks: Record<string, any>;
  timestamp: string;
}

interface Seed {
  id: string;
  name: string;
  description: string;
  class: string;
  data_count: string;
}

export default function SettingsPage() {
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [agentPausedEnabled, setAgentPausedEnabled] = useState(false);
  const [showMaskedCredentials, setShowMaskedCredentials] = useState<Record<string, boolean>>({});
  const [maskedValues, setMaskedValues] = useState<Record<string, string>>({});
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingSeeds, setIsLoadingSeeds] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiClient.get('/settings/grouped');
      let data = response.data?.data ?? {};
      if (Array.isArray(data)) {
        data = {};
      }
      setGroupedSettings(data);
      setEditedValues(
        (Object.values(data).flat() as SettingEntry[]).reduce((acc: Record<string, any>, entry: SettingEntry) => {
          acc[entry.key] = entry.value;
          return acc;
        }, {})
      );
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Unable to load settings from backend.');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthStatus = async () => {
    setIsLoadingHealth(true);
    try {
      const response = await apiClient.get('/monitoring/health');
      setHealthStatus(response.data);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Failed to load health status.');
      setHealthStatus(null);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const loadSeeds = async () => {
    setIsLoadingSeeds(true);
    try {
      const response = await apiClient.get('/settings/seeds');
      setSeeds(response.data?.data ?? []);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Failed to load seeds.');
      setSeeds([]);
    } finally {
      setIsLoadingSeeds(false);
    }
  };

  const loadMaskedCredential = async (key: string) => {
    try {
      const response = await apiClient.get(`/settings/${key}/masked`);
      setMaskedValues((prev) => ({ ...prev, [key]: response.data?.data?.masked }));
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Failed to load masked credential.');
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadSettings();
    };
    void load();
  }, []);

  const handleValueChange = (key: string, value: any) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    const updates = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) {
      setSuccessMsg('No changes detected.');
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await apiClient.put('/settings/bulk', { settings: updates });
      setSuccessMsg('System settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadSettings();
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleFactoryReset = async () => {
    if (!confirm('Are you sure you want to clear all logs and reload settings?')) return;
    
    setSaving(true);
    setErrorMsg('');

    try {
      await apiClient.post('/logs/clear');
      await loadSettings();
      setSuccessMsg('System cache cleared and settings refreshed from backend.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Factory reset failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAgentPause = async () => {
    setSaving(true);
    setErrorMsg('');

    try {
      const response = await apiClient.post('/settings/system/agent-pause', {
        enabled: !agentPausedEnabled,
        reason: 'Emergency pause toggled from UI',
      });
      setAgentPausedEnabled(response.data?.data?.enabled);
      setSuccessMsg(`Agent pause ${!agentPausedEnabled ? 'ACTIVATED' : 'DEACTIVATED'}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Failed to toggle agent pause.');
    } finally {
      setSaving(false);
    }
  };

  const handleRunSeed = async (seedId: string) => {
    if (!confirm(`Are you sure you want to run the ${seedId} seeder?`)) return;

    setSaving(true);
    setErrorMsg('');

    try {
      const response = await apiClient.post(`/settings/seeds/${seedId}/run`);
      setSuccessMsg(`Seeder ${seedId} completed successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Failed to run seeder.');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingControl = (setting: SettingEntry) => {
    const value = editedValues[setting.key];

    if (setting.type === 'boolean') {
      return (
        <NxSwitch
          label={setting.description || setting.key}
          checked={Boolean(value)}
          onChange={(e) => handleValueChange(setting.key, e.target.checked)}
        />
      );
    }

    if (setting.type === 'integer') {
      return (
        <NxInput
          type='number'
          value={String(value ?? '')}
          onChange={(e) => handleValueChange(setting.key, Number(e.target.value))}
        />
      );
    }

    if (setting.type === 'json' || setting.type === 'text') {
      return (
        <div className='space-y-1'>
          <label htmlFor={setting.key} className='sr-only'>{setting.key}</label>
          <textarea
            id={setting.key}
            placeholder={`Enter ${setting.type}...`}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className='w-full min-h-[120px] rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-gray-100 outline-none transition-colors focus:border-nexus-blue focus:ring-2 focus:ring-nexus-blue/10'
          />
        </div>
      );
    }

    return (
      <NxInput
        value={String(value ?? '')}
        onChange={(e) => handleValueChange(setting.key, e.target.value)}
      />
    );
  };

  return (
    <AppLayout>
      <div className='p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2'>
              <Settings className='w-6 h-6 text-nexus-blue animate-pulse' />
              Settings & Administration
            </h1>
            <p className='text-sm text-gray-400 mt-1'>
              Manage application configuration, integrations, health monitoring, and system controls.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-2 border-b border-white/10 pb-3'>
          {(['general', 'integrations', 'health', 'api-tester', 'seeds', 'advanced'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'health') loadHealthStatus();
                if (tab === 'seeds') loadSeeds();
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-nexus-blue/20 text-nexus-blue border border-nexus-blue/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`}
            >
              {tab === 'general' && 'General'}
              {tab === 'integrations' && 'Integrations'}
              {tab === 'health' && 'Health & Diagnostics'}
              {tab === 'api-tester' && 'API Tester'}
              {tab === 'seeds' && 'Database Seeds'}
              {tab === 'advanced' && 'Advanced'}
            </button>
          ))}
        </div>

        {successMsg ? (
          <div className='bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs p-3.5 rounded-xl'>
            <div className='flex items-center gap-2'>
              <Check className='w-4 h-4 text-emerald-400' />
              <span>{successMsg}</span>
            </div>
          </div>
        ) : null}

        {errorMsg ? (
          <div className='bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3.5 rounded-xl'>
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className='grid grid-cols-1 gap-6'>
            {loading ? (
              <NxGlassCard className='p-6 text-center text-gray-400'>Loading settings…</NxGlassCard>
            ) : Object.keys(groupedSettings).length === 0 ? (
              <NxGlassCard className='p-6 text-center text-gray-400'>No settings are available. Please verify backend configuration.</NxGlassCard>
            ) : (
              Object.entries(groupedSettings)
                .filter(([group]) => !group.startsWith('integrations') && group !== 'security')
                .map(([group, settings]) => (
                  <NxGlassCard key={group} className='p-6 bg-black/40 border-white/10'>
                    <div className='mb-4 flex items-center justify-between gap-4'>
                      <div>
                        <p className='text-sm uppercase tracking-[0.25em] text-gray-500'>{group}</p>
                        <h2 className='text-lg font-semibold text-gray-100'>Configuration Group</h2>
                      </div>
                      <span className='text-xs text-gray-400'>{settings.length} keys</span>
                    </div>

                    <div className='grid gap-4'>
                      {settings.map((setting) => (
                        <div key={setting.key} className='space-y-2'>
                          <div className='flex items-center justify-between gap-3'>
                            <div>
                              <p className='text-sm font-semibold text-gray-100'>{setting.key}</p>
                              {setting.description ? <p className='text-xs text-gray-500'>{setting.description}</p> : null}
                            </div>
                            <span className='text-[10px] uppercase tracking-[0.28em] text-gray-500'>{setting.type}</span>
                          </div>
                          {renderSettingControl(setting)}
                        </div>
                      ))}
                    </div>
                  </NxGlassCard>
                ))
            )}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className='grid grid-cols-1 gap-6'>
            {loading ? (
              <NxGlassCard className='p-6 text-center text-gray-400'>Loading integrations…</NxGlassCard>
            ) : (
              <>
                {groupedSettings.integrations && groupedSettings.integrations.length > 0 ? (
                  <NxGlassCard className='p-6 bg-black/40 border-white/10'>
                    <div className='mb-4 flex items-center justify-between gap-4'>
                      <div>
                        <p className='text-sm uppercase tracking-[0.25em] text-gray-500'>API Integrations</p>
                        <h2 className='text-lg font-semibold text-gray-100'>Third-Party Services</h2>
                      </div>
                      <span className='text-xs text-gray-400'>{groupedSettings.integrations?.length || 0} keys</span>
                    </div>

                    <div className='grid gap-4'>
                      {groupedSettings.integrations?.map((setting) => (
                        <div key={setting.key} className='space-y-2'>
                          <div className='flex items-center justify-between gap-3'>
                            <div>
                              <p className='text-sm font-semibold text-gray-100'>{setting.key}</p>
                              {setting.description ? <p className='text-xs text-gray-500'>{setting.description}</p> : null}
                            </div>
                            {setting.is_encrypted && (
                              <Shield className='w-4 h-4 text-yellow-500' aria-label='Encrypted' />
                            )}
                          </div>
                          <div className='flex gap-2'>
                            {setting.is_encrypted ? (
                              <>
                                <button
                                  onClick={() => {
                                    setShowMaskedCredentials((prev) => ({
                                      ...prev,
                                      [setting.key]: !prev[setting.key],
                                    }));
                                    if (!showMaskedCredentials[setting.key]) {
                                      loadMaskedCredential(setting.key);
                                    }
                                  }}
                                  className='flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/20'
                                >
                                  {showMaskedCredentials[setting.key] ? (
                                    <>
                                      <EyeOff className='w-3 h-3' /> Hide
                                    </>
                                  ) : (
                                    <>
                                      <Eye className='w-3 h-3' /> Show
                                    </>
                                  )}
                                </button>
                                {showMaskedCredentials[setting.key] && maskedValues[setting.key] && (
                                  <div className='text-xs text-yellow-300'>{maskedValues[setting.key]}</div>
                                )}
                              </>
                            ) : (
                              renderSettingControl(setting)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </NxGlassCard>
                ) : (
                  <NxGlassCard className='p-6 text-center text-gray-400'>
                    No integrations available. Please verify backend configuration.
                  </NxGlassCard>
                )}
              </>
            )}
          </div>
        )}

        {/* Health & Diagnostics Tab */}
        {activeTab === 'health' && (
          <div className='grid grid-cols-1 gap-6'>
            <NxActionButton
              variant='primary'
              size='sm'
              onClick={loadHealthStatus}
              disabled={isLoadingHealth}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoadingHealth ? 'animate-spin' : ''}`} />}
            >
              Refresh Health Status
            </NxActionButton>

            {isLoadingHealth ? (
              <NxGlassCard className='p-6 text-center text-gray-400'>
                <Loader className='w-6 h-6 animate-spin mx-auto mb-2' />
                Loading health status…
              </NxGlassCard>
            ) : healthStatus ? (
              <>
                <NxGlassCard className='p-6 bg-black/40 border-white/10'>
                  <div className='mb-4'>
                    <h2 className='text-lg font-semibold text-gray-100'>System Status</h2>
                    <p className='text-sm text-gray-400 mt-1'>
                      Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${
                    healthStatus.status === 'healthy'
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : healthStatus.status === 'degraded'
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      healthStatus.status === 'healthy'
                        ? 'text-emerald-200'
                        : healthStatus.status === 'degraded'
                        ? 'text-yellow-200'
                        : 'text-red-200'
                    }`}>
                      Status: {healthStatus.status.toUpperCase()}
                    </p>
                  </div>
                </NxGlassCard>

                {Object.entries(healthStatus.checks).map(([service, check]: [string, any]) => (
                  <NxGlassCard key={service} className='p-6 bg-black/40 border-white/10'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-lg font-semibold text-gray-100 capitalize'>{service}</h3>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        check.ok
                          ? 'bg-emerald-500/10 text-emerald-200'
                          : 'bg-red-500/10 text-red-200'
                      }`}>
                        {check.ok ? '✓ OK' : '✗ ERROR'}
                      </div>
                    </div>
                    <pre className='text-xs bg-black/40 p-3 rounded border border-white/5 text-gray-300 overflow-x-auto'>
                      {JSON.stringify(check, null, 2)}
                    </pre>
                  </NxGlassCard>
                ))}
              </>
            ) : (
              <NxGlassCard className='p-6 text-center text-gray-400'>
                No health data available.
              </NxGlassCard>
            )}
          </div>
        )}

        {/* API Tester Tab */}
        {activeTab === 'api-tester' && (
          <ApiTesterPanel />
        )}

        {/* Database Seeds Tab */}
        {activeTab === 'seeds' && (
          <div className='grid grid-cols-1 gap-6'>
            <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4'>
              <div className='flex gap-2 text-yellow-200'>
                <AlertTriangle className='w-4 h-4 flex-shrink-0 mt-0.5' />
                <p className='text-sm'>
                  Database seeders populate the database with test data and workflow templates. Use with caution in production.
                </p>
              </div>
            </div>

            {isLoadingSeeds ? (
              <NxGlassCard className='p-6 text-center text-gray-400'>
                <Loader className='w-6 h-6 animate-spin mx-auto mb-2' />
                Loading seeders…
              </NxGlassCard>
            ) : seeds.length > 0 ? (
              seeds.map((seed) => (
                <NxGlassCard key={seed.id} className='p-6 bg-black/40 border-white/10'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-100'>{seed.name}</h3>
                      <p className='text-sm text-gray-400 mt-1'>{seed.description}</p>
                      <p className='text-xs text-gray-500 mt-2'>Creates: {seed.data_count}</p>
                    </div>
                    <NxActionButton
                      variant='primary'
                      size='sm'
                      onClick={() => handleRunSeed(seed.id)}
                      disabled={saving}
                    >
                      Run Seeder
                    </NxActionButton>
                  </div>
                </NxGlassCard>
              ))
            ) : (
              <NxGlassCard className='p-6 text-center text-gray-400'>
                No seeders available.
              </NxGlassCard>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className='grid grid-cols-1 gap-6'>
            <NxGlassCard className='p-6 bg-red-500/5 border border-red-500/20'>
              <div className='flex items-start gap-4'>
                <AlertTriangle className='w-5 h-5 text-red-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='text-lg font-semibold text-red-200'>Danger Zone</h3>
                  <p className='text-sm text-red-300 mt-1'>
                    These operations can significantly impact the system. Use only if you know what you're doing.
                  </p>
                </div>
              </div>
            </NxGlassCard>

            <NxGlassCard className='p-6 bg-black/40 border border-yellow-500/20'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-100 flex items-center gap-2'>
                    <Zap className='w-5 h-5 text-yellow-500' />
                    Global Agent Pause
                  </h3>
                  <p className='text-sm text-gray-400 mt-1'>
                    Emergency control to pause all agents system-wide. Use in case of critical issues.
                  </p>
                  <p className={`text-xs mt-2 ${agentPausedEnabled ? 'text-red-300' : 'text-gray-500'}`}>
                    Status: {agentPausedEnabled ? '⚠️ PAUSED' : '✓ RUNNING'}
                  </p>
                </div>
                <NxActionButton
                  variant={agentPausedEnabled ? 'danger' : 'secondary'}
                  size='sm'
                  onClick={handleToggleAgentPause}
                  disabled={saving}
                >
                  {agentPausedEnabled ? 'Resume Agents' : 'Pause Agents'}
                </NxActionButton>
              </div>
            </NxGlassCard>

            <NxGlassCard className='p-6 bg-black/40 border-white/10'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-100 flex items-center gap-2'>
                    <Trash2 className='w-5 h-5 text-orange-500' />
                    Clear Cache
                  </h3>
                  <p className='text-sm text-gray-400 mt-1'>
                    Clear application logs and reload settings from backend.
                  </p>
                </div>
                <NxActionButton
                  variant='danger'
                  size='sm'
                  onClick={handleFactoryReset}
                  disabled={saving}
                  className='bg-orange-950 text-orange-200 hover:bg-orange-900 border border-orange-500/20'
                >
                  Reset Cache
                </NxActionButton>
              </div>
            </NxGlassCard>
          </div>
        )}

        {/* Save Button (only for General tab) */}
        {activeTab === 'general' && (
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-white/5 pt-4'>
            <div className='text-sm text-gray-400'>
              Changes are stored to the backend settings registry and will be reflected across the Nexus workspace on save.
            </div>
            <div className='flex flex-wrap gap-3'>
              <NxActionButton variant='secondary' size='sm' onClick={loadSettings} leftIcon={<RefreshCw className='w-4 h-4' />}>
                Reload From Server
              </NxActionButton>
              <NxActionButton variant='primary' size='sm' onClick={handleSaveSettings} disabled={saving}>
                Save Settings
              </NxActionButton>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
