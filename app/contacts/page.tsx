"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxEmptyState } from '@/components/NxEmptyState';
import { NxContactCard3D } from '@/components/NxContactCard3D';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxDrawer } from '@/components/NxDrawer';
import { NxInput } from '@/components/NxInput';
import { NxActionButton } from '@/components/NxActionButton';
import { NxTable, NxTableHeader, NxTableBody } from '@/components/NxTable';
import { NxTableRow } from '@/components/NxTableRow';
import { NxTableCell, NxTableHead } from '@/components/NxTableCell';
import { useAppStore } from '@/store/store-provider';
import { ContactCardSkeleton, GridCardSkeleton } from '@/components/SkeletonLoaders';
import { Users, Search, Plus, User, Building, Mail, Phone, RefreshCw, LayoutGrid, List, Upload, Brain, Database, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logError } from '@/lib/utils/error-handler';
import apiClient from '@/lib/api/client';

type ReplyMode = 'manual' | 'copilot' | 'autopilot';

interface ContactHubStats {
  total_contacts: number;
  active_contacts: number;
  new_imported_messages: number;
  pending_analysis_runs: number;
  stale_memory_count: number;
  identity_conflict_count: number;
  autopilot_enabled_count: number;
  failed_imports: number;
  failed_analysis_runs: number;
}

interface ImportPreviewResult {
  success: boolean;
  source?: string;
  format?: string;
  total_messages?: number;
  inbound_count?: number;
  outbound_count?: number;
  unique_senders?: number;
  date_range?: {
    start?: string | null;
    end?: string | null;
  };
  error?: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const contacts = useAppStore((state) => state.contacts);
  const hydrateContacts = useAppStore((state) => state.hydrateContacts);
  const createContact = useAppStore((state) => state.createContact);
  const addJob = useAppStore((state) => (state as any).addJob);
  const addNotification = useAppStore((state) => state.addNotification);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ContactHubStats | null>(null);
  const [globalReplyMode, setGlobalReplyMode] = useState<ReplyMode>('manual');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importContactId, setImportContactId] = useState('');
  const [importSource, setImportSource] = useState<'whatsapp' | 'facebook'>('whatsapp');
  const [importFormat, setImportFormat] = useState<'txt' | 'json'>('txt');
  const [importContent, setImportContent] = useState('');
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Registration form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [formError, setFormError] = useState("");

  const loadHubControls = useCallback(async () => {
    try {
      const [statsResponse, modeResponse] = await Promise.all([
        apiClient.get('/v1/contacts/stats'),
        apiClient.get('/v1/contacts/reply-mode'),
      ]);

      const nextStats = (statsResponse.data as { data?: ContactHubStats }).data;
      const nextMode = (modeResponse.data as { data?: { mode?: ReplyMode } }).data?.mode;

      if (nextStats) {
        setStats(nextStats);
      }
      if (nextMode) {
        setGlobalReplyMode(nextMode);
      }
    } catch (error) {
      logError('Failed to load ContactHub controls', error);
      addNotification('warning', 'ContactHub controls could not be refreshed');
    }
  }, [addNotification]);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([hydrateContacts(), loadHubControls()]);
    } catch (error) {
      logError('Failed to load contacts', error);
      addNotification('error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [hydrateContacts, addNotification]);

  useEffect(() => {
    const load = async () => {
      await loadContacts();
    };
    void load();
  }, [loadContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newName.trim() || !newRole.trim() || !newCompany.trim() || !newEmail.trim() || !newPhone.trim()) {
      setFormError("All input fields are required.");
      return;
    }

    try {
      await createContact({
        name: newName.trim(),
        role: newRole.trim(),
        company: newCompany.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim()
      });

      addJob?.(`Deploying background intelligence parsing for ${newName.trim()}`);

      // Reset Form
      setNewName("");
      setNewRole("");
      setNewCompany("");
      setNewEmail("");
      setNewPhone("");
      setIsDrawerOpen(false);
    } catch (error) {
      logError('Failed to create contact', error);
      addNotification('error', 'Failed to create contact');
    }
  };

  const handleReload = () => {
    loadContacts();
    addJob?.("Flushing relation directory database");
  };

  const handleGlobalReplyMode = async (mode: ReplyMode) => {
    const previous = globalReplyMode;
    setGlobalReplyMode(mode);

    try {
      await apiClient.patch('/v1/contacts/reply-mode', { mode });
      addNotification('success', `Global reply mode set to ${mode}`);
    } catch (error) {
      setGlobalReplyMode(previous);
      logError('Failed to update global reply mode', error);
      addNotification('error', 'Failed to update reply mode');
    }
  };

  const buildImportPayload = () => ({
    contact_id: Number(importContactId),
    source: importSource,
    format: importFormat,
    content: importContent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  const handlePreviewImport = async () => {
    if (!importContactId || !importContent.trim()) {
      addNotification('warning', 'Choose a contact and paste an export before previewing');
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiClient.post('/v1/contacts/import/preview', buildImportPayload());
      setImportPreview((response.data as { data?: ImportPreviewResult }).data ?? null);
      addNotification('success', 'Import preview generated');
    } catch (error) {
      logError('Failed to preview contact import', error);
      addNotification('error', 'Failed to preview import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importContactId || !importContent.trim()) {
      addNotification('warning', 'Choose a contact and paste an export before importing');
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiClient.post(`/v1/contacts/import/${importSource}`, buildImportPayload());
      const result = (response.data as { data?: { created?: number; duplicates?: number } }).data;
      addNotification('success', `Imported ${result?.created ?? 0} messages`);
      setImportContent('');
      setImportPreview(null);
      setIsImportOpen(false);
      await loadContacts();
    } catch (error) {
      logError('Failed to import contact messages', error);
      addNotification('error', 'Failed to import messages');
    } finally {
      setIsImporting(false);
    }
  };

  // Filter list
  const filteredContacts = contacts.filter(contact => {
    const term = searchQuery.toLowerCase();
    const roleTerm = roleFilter.toLowerCase();
    const companyTerm = companyFilter.toLowerCase();

    const matchesSearch = term === "" ||
      (contact.name ?? "").toLowerCase().includes(term) ||
      (contact.email ?? "").toLowerCase().includes(term) ||
      (contact.phone ?? "").toLowerCase().includes(term);

    const matchesRole = roleTerm === "" || (contact.role ?? "").toLowerCase().includes(roleTerm);
    const matchesCompany = companyTerm === "" || (contact.company ?? "").toLowerCase().includes(companyTerm);

    return matchesSearch && matchesRole && matchesCompany;
  });

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto animate-in fade-in duration-300">

        {/* Header Module */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-nexus-blue" />
              Contacts Intelligence
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Configure cognitive context databases by mapping relationship attributes and roles.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <NxActionButton
              variant="secondary"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Import Messages
            </NxActionButton>
            <NxActionButton
              variant="secondary"
              size="sm"
              onClick={handleReload}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reload Setup
            </NxActionButton>
            <NxActionButton
              variant="primary"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Contact
            </NxActionButton>
          </div>
        </div>

        {/* Operational Controls */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {[
              ['Contacts', stats?.total_contacts ?? contacts.length],
              ['Active', stats?.active_contacts ?? 0],
              ['New Msg', stats?.new_imported_messages ?? 0],
              ['AI Queue', stats?.pending_analysis_runs ?? 0],
              ['Stale Memory', stats?.stale_memory_count ?? 0],
              ['Conflicts', stats?.identity_conflict_count ?? 0],
              ['Autopilot', stats?.autopilot_enabled_count ?? 0],
              ['Failures', (stats?.failed_imports ?? 0) + (stats?.failed_analysis_runs ?? 0)],
            ].map(([label, value]) => (
              <NxGlassCard key={label} className="px-3 py-3">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
                <div className="mt-1 text-xl font-semibold text-gray-100">{value}</div>
              </NxGlassCard>
            ))}
          </div>

          <NxGlassCard className="p-3 flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Global Reply Mode</div>
              {globalReplyMode === 'autopilot' && (
                <AlertTriangle className="w-4 h-4 text-amber-300" />
              )}
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-black/20 p-1 border border-white/5">
              {(['manual', 'copilot', 'autopilot'] as ReplyMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleGlobalReplyMode(mode)}
                  className={`h-8 rounded-md text-xs font-medium capitalize transition-colors ${
                    globalReplyMode === mode
                      ? mode === 'autopilot'
                        ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30'
                        : 'bg-nexus-blue/20 text-blue-100 border border-nexus-blue/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NxActionButton
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Brain className="w-4 h-4" />}
                onClick={() => addNotification('info', 'Batch analysis endpoint is ready for selected contacts')}
              >
                Analyze
              </NxActionButton>
              <NxActionButton
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Database className="w-4 h-4" />}
                onClick={() => addNotification('info', 'Memory maintenance runs are available from the ContactHub API')}
              >
                Maintain
              </NxActionButton>
            </div>
          </NxGlassCard>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="w-full md:w-80 relative">
            <NxInput
              icon={<Search className="w-4 h-4 text-gray-500" />}
              placeholder="Search by details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <NxInput
              placeholder="Filter by role..."
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-44 text-xs font-sans h-9 bg-black/10"
            />
            <NxInput
              placeholder="Filter by company..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full sm:w-44 text-xs font-sans h-9 bg-black/10"
            />

            {/* Mode Toggles */}
            <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-nexus-blue/15 text-nexus-blue border border-nexus-blue/20' : 'text-gray-400 hover:text-white'}`}
                title="Grid visual layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-nexus-blue/15 text-nexus-blue border border-nexus-blue/20' : 'text-gray-400 hover:text-white'}`}
                title="Table layout view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contacts Results Stream */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ContactCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <NxGlassCard className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <GridCardSkeleton key={i} />
              ))}
            </NxGlassCard>
          )
        ) : filteredContacts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredContacts.map((c) => (
                <div key={c.id} className="cursor-pointer" onClick={() => router.push(`/contacts/${c.id}`)}>
                  <NxContactCard3D contact={c} />
                </div>
              ))}
            </div>
          ) : (
            <NxGlassCard className="p-0 overflow-hidden">
              <NxTable>
                <NxTableHeader>
                  <NxTableRow>
                    <NxTableHead>Profile</NxTableHead>
                    <NxTableHead>Role</NxTableHead>
                    <NxTableHead>Company</NxTableHead>
                    <NxTableHead>Email Channel</NxTableHead>
                    <NxTableHead>Details</NxTableHead>
                  </NxTableRow>
                </NxTableHeader>
                <NxTableBody>
                  {filteredContacts.map((c) => (
                    <NxTableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => router.push(`/contacts/${c.id}`)}
                    >
                      <NxTableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-white/10 bg-black/20 overflow-hidden relative mr-1">
                            <Image
                              src={c.avatar || `https://picsum.photos/seed/${c.id}/80/80`}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              width={80}
                              height={80}
                            />
                          </div>
                          <span className="font-semibold text-gray-200">{c.name}</span>
                        </div>
                      </NxTableCell>
                      <NxTableCell className="text-nexus-blue text-xs">{c.role}</NxTableCell>
                      <NxTableCell className="text-gray-300 text-xs font-mono">{c.company}</NxTableCell>
                      <NxTableCell className="text-gray-400 text-xs font-mono">{c.email}</NxTableCell>
                      <NxTableCell>
                        <Link href={`/contacts/${c.id}`} className="text-[11px] text-gray-400 font-bold hover:text-nexus-blue transition-colors uppercase font-mono tracking-wide">
                          Audit
                        </Link>
                      </NxTableCell>
                    </NxTableRow>
                  ))}
                </NxTableBody>
              </NxTable>
            </NxGlassCard>
          )
        ) : (
          <div className="py-20 flex justify-center">
            <NxEmptyState
              title="No relational contacts matching criteria"
              description={searchQuery || roleFilter || companyFilter ? "Refine your filter metrics or clear queries to fetch records." : "Onboard contacts to start database orchestration."}
              icon={<Users className="w-10 h-10 text-gray-500 animate-pulse" />}
              action={
                <NxActionButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("");
                    setCompanyFilter("");
                  }}
                >
                  Clear All Filters
                </NxActionButton>
              }
            />
          </div>
        )}

        {/* Add Contact Drawer */}
        <NxDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Register High Value Profile">
          <form onSubmit={handleAddContact} className="flex flex-col gap-4">
            {formError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-center gap-2">
                <User className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Contact Full Name</label>
              <NxInput value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Dr. Hédra Adel" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Corporate Role Taxonomy</label>
              <NxInput value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g. Lead Devops Architect" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Enterprise Company</label>
              <NxInput value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="e.g. Nexus Core" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Secure Email Stream</label>
              <NxInput type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="e.g. admin@nexus.io" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 font-sans">Secure Direct Phone</label>
              <NxInput value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. +1 (555) 948-2321" required />
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
              <NxActionButton type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</NxActionButton>
              <NxActionButton type="submit" variant="primary">Register Profile</NxActionButton>
            </div>
          </form>
        </NxDrawer>

        {/* Message Import Drawer */}
        <NxDrawer isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Import Contact Messages" size="xl">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Contact</label>
              <select
                value={importContactId}
                onChange={(event) => {
                  setImportContactId(event.target.value);
                  setImportPreview(null);
                }}
                className="w-full h-10 rounded-md bg-black/20 border border-white/10 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-nexus-blue"
              >
                <option value="">Select contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Source</label>
                <select
                  value={importSource}
                  onChange={(event) => {
                    setImportSource(event.target.value as 'whatsapp' | 'facebook');
                    setImportPreview(null);
                  }}
                  className="w-full h-10 rounded-md bg-black/20 border border-white/10 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-nexus-blue"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Format</label>
                <select
                  value={importFormat}
                  onChange={(event) => {
                    setImportFormat(event.target.value as 'txt' | 'json');
                    setImportPreview(null);
                  }}
                  className="w-full h-10 rounded-md bg-black/20 border border-white/10 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-nexus-blue"
                >
                  <option value="txt">Text Export</option>
                  <option value="json">JSON Export</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Export Content</label>
              <textarea
                value={importContent}
                onChange={(event) => {
                  setImportContent(event.target.value);
                  setImportPreview(null);
                }}
                rows={12}
                className="w-full resize-y rounded-md bg-black/20 border border-white/10 px-3 py-2 text-sm text-gray-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-nexus-blue"
                placeholder="Paste exported conversation content here..."
              />
            </div>

            {importPreview && (
              <NxGlassCard className="p-4">
                {importPreview.success ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Messages</div>
                      <div className="text-lg text-gray-100 font-semibold">{importPreview.total_messages ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Senders</div>
                      <div className="text-lg text-gray-100 font-semibold">{importPreview.unique_senders ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Inbound</div>
                      <div className="text-lg text-gray-100 font-semibold">{importPreview.inbound_count ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Outbound</div>
                      <div className="text-lg text-gray-100 font-semibold">{importPreview.outbound_count ?? 0}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-200">{importPreview.error ?? 'Preview failed'}</div>
                )}
              </NxGlassCard>
            )}

            <div className="mt-4 flex justify-end gap-3 border-t border-white/5 pt-4">
              <NxActionButton type="button" variant="secondary" onClick={handlePreviewImport} isLoading={isImporting}>
                Preview
              </NxActionButton>
              <NxActionButton type="button" variant="primary" onClick={handleCommitImport} isLoading={isImporting}>
                Commit Import
              </NxActionButton>
            </div>
          </div>
        </NxDrawer>

      </div>
    </AppLayout>
  );
}
