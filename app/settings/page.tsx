"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxSwitch } from '@/components/NxSwitch';
import { NxSlider } from '@/components/NxSlider';
import { NxActionButton } from '@/components/NxActionButton';
import { NxInput } from '@/components/NxInput';
import { Settings, Trash2, Database, Cpu, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface SettingEntry {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  group: string;
  description?: string;
  is_public: boolean;
}

type GroupedSettings = Record<string, SettingEntry[]>;

export default function SettingsPage() {
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiClient.get('/settings/grouped');
      const data = response.data?.data ?? {};
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

  useEffect(() => {
    loadSettings();
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
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => handleValueChange(setting.key, e.target.value)}
          className='w-full min-h-[120px] rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-gray-100 outline-none transition-colors focus:border-nexus-blue focus:ring-2 focus:ring-nexus-blue/10'
        />
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
              Settings Configuration
            </h1>
            <p className='text-sm text-gray-400 mt-1'>
              Manage application configuration settings, visibility groups, and runtime preferences.
            </p>
          </div>
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

        <div className='grid grid-cols-1 gap-6'>
          {loading ? (
            <NxGlassCard className='p-6 text-center text-gray-400'>Loading settings…</NxGlassCard>
          ) : Object.keys(groupedSettings).length === 0 ? (
            <NxGlassCard className='p-6 text-center text-gray-400'>No settings are available. Please verify backend configuration.</NxGlassCard>
          ) : (
            Object.entries(groupedSettings).map(([group, settings]) => (
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

        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
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
            <NxActionButton variant='danger' size='sm' onClick={handleFactoryReset} className='bg-red-950 text-red-200 hover:bg-red-900 border border-red-500/20'>
              <Trash2 className='w-4 h-4' /> Reset Cache
            </NxActionButton>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
