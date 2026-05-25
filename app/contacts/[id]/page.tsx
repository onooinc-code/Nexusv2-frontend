"use client";

import React, { useState, useEffect, useCallback, use } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxRelationTimeline } from '@/components/NxRelationTimeline';
import { NxInput } from '@/components/NxInput';
import { NxDrawer } from '@/components/NxDrawer';
import { NxMetricCard } from '@/components/NxMetricCard';
import { useAppStore } from '@/store/store-provider';
import { ArrowLeft, User, Mail, Phone, Building, Edit2, Trash2, ShieldAlert, FileText, Activity, Save, Plus, Loader2, BarChart3, Users, MessageSquare, Calendar, Link2, Settings, X, Check, Pin, Trash } from 'lucide-react';
import type { TimelineEvent, ContactNote as ContactNoteType } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface ContactData {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface ContactAnalytics {
  type: string;
  last_seen_at: string;
  memory_count: number;
  tag_count: number;
  rule_count: number;
  baseline: string;
  time_series: {
    memories: { date: string; count: number }[];
    messages: { date: string; count: number }[];
    conversations: { date: string; count: number }[];
  };
}

interface ContactRelationship {
  id: number;
  contact_id: number;
  related_contact_id: number;
  related_contact?: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
  relationship_type: string;
  mention_count: number;
  confidence: number;
  created_at: string;
  updated_at: string;
}

interface ContactIdentifier {
  id: number;
  contact_id: number;
  type: string;
  value: string;
  trusted: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactAlias {
  id: number;
  primary_contact_id: number;
  alias_name: string;
  confidence: number;
  created_context: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactPreference {
  id: number;
  contact_id: number;
  preference_type: string;
  value: string;
  confidence: number;
  inferred_from_count: number;
  created_at: string;
  updated_at: string;
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const contacts = useAppStore((state) => state.contacts);
  const hydrateContacts = useAppStore((state) => state.hydrateContacts);
  const updateContact = useAppStore((state) => state.updateContact);
  const deleteContact = useAppStore((state) => state.deleteContact);
  const addJob = useAppStore((state) => (state as any).addJob);
  const addNotification = useAppStore((state) => state.addNotification);
  const fetchContactTimeline = useAppStore((state) => (state as any).fetchContactTimeline);
  const fetchContactNotes = useAppStore((state) => (state as any).fetchContactNotes);
  const addContactNote = useAppStore((state) => (state as any).addContactNote);
  const deleteContactNote = useAppStore((state) => (state as any).deleteContactNote);
  const currentContact = useAppStore((state) => state.currentContact);

  const [contact, setContact] = useState<ContactData | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'analytics' | 'identifiers' | 'relationships' | 'preferences' | 'aliases'>('timeline');
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState<ContactAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Notes state
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Timeline state
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Identifiers state
  const [identifiers, setIdentifiers] = useState<ContactIdentifier[]>([]);
  const [isLoadingIdentifiers, setIsLoadingIdentifiers] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState({ type: 'email', value: '', trusted: true });
  const [identifierError, setIdentifierError] = useState('');

  // Relationships state
  const [relationships, setRelationships] = useState<ContactRelationship[]>([]);
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);
  const [newRelationship, setNewRelationship] = useState({ related_contact_id: '', relationship_type: 'work', mention_count: 1, confidence: 1.0 });
  const [relationshipError, setRelationshipError] = useState('');

  // Preferences state
  const [preferences, setPreferences] = useState<ContactPreference[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [newPreference, setNewPreference] = useState({ preference_type: 'channel', value: '', confidence: 1.0, inferred_from_count: 0 });
  const [preferenceError, setPreferenceError] = useState('');

  // Aliases state
  const [aliases, setAliases] = useState<ContactAlias[]>([]);
  const [isLoadingAliases, setIsLoadingAliases] = useState(false);
  const [newAlias, setNewAlias] = useState({ alias_name: '', confidence: 1.0, created_context: '' });
  const [aliasError, setAliasError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<ContactData>>({});

  // Derived from store
  const timelineEvents: TimelineEvent[] = (currentContact?.timeline ?? []) as TimelineEvent[];
  const notes: ContactNoteType[] = (currentContact?.notes ?? []) as ContactNoteType[];

  const loadContact = useCallback(async () => {
    try {
      await hydrateContacts();
      // Fetch contact details from API
      const response = await apiClient.get(`/v1/contacts/${resolvedParams.id}`);
      const apiContact = response.data.data || response.data;
      const contactData: ContactData = {
        id: apiContact.id.toString(),
        name: apiContact.name,
        role: apiContact.role || apiContact.title || '',
        company: apiContact.company || '',
        email: apiContact.email || '',
        phone: apiContact.phone || '',
        avatar: apiContact.avatar_url,
      };
      setContact(contactData);
      setEditForm(contactData);
    } catch (error) {
      console.error('Failed to load contact:', error);
      addNotification('error', 'Failed to load contact');
      router.replace('/contacts');
    }
  }, [resolvedParams.id, hydrateContacts, addNotification, router]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const loadAnalytics = useCallback(async () => {
    if (!contact) return;
    setIsLoadingAnalytics(true);
    try {
      const response = await apiClient.get(`/v1/contacts/${contact.id}/analytics`);
      setAnalytics(response.data.data?.analytics || response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [contact]);

  useEffect(() => {
    if (activeTab === 'analytics' && contact) {
      loadAnalytics();
    }
  }, [activeTab, contact, loadAnalytics]);

  const loadIdentifiers = useCallback(async () => {
    if (!contact) return;
    setIsLoadingIdentifiers(true);

    try {
      const response = await apiClient.get(`/v1/contacts/${contact.id}/identifiers`);
      setIdentifiers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load identifiers:', error);
    } finally {
      setIsLoadingIdentifiers(false);
    }
  }, [contact]);

  const loadRelationships = useCallback(async () => {
    if (!contact) return;
    setIsLoadingRelationships(true);

    try {
      const response = await apiClient.get(`/v1/contacts/${contact.id}/relationships`);
      setRelationships(response.data.data || []);
    } catch (error) {
      console.error('Failed to load relationships:', error);
    } finally {
      setIsLoadingRelationships(false);
    }
  }, [contact]);

  const loadPreferences = useCallback(async () => {
    if (!contact) return;
    setIsLoadingPreferences(true);

    try {
      const response = await apiClient.get(`/v1/contacts/${contact.id}/preferences`);
      setPreferences(response.data.data || []);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [contact]);

  const loadAliases = useCallback(async () => {
    if (!contact) return;
    setIsLoadingAliases(true);

    try {
      const response = await apiClient.get(`/v1/contacts/${contact.id}/aliases`);
      setAliases(response.data.data || []);
    } catch (error) {
      console.error('Failed to load aliases:', error);
    } finally {
      setIsLoadingAliases(false);
    }
  }, [contact]);

  const loadTimeline = useCallback(async () => {
    if (!contact) return;
    setIsLoadingTimeline(true);
    try {
      await fetchContactTimeline(contact.id);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setIsLoadingTimeline(false);
    }
  }, [contact, fetchContactTimeline]);

  const loadNotes = useCallback(async () => {
    if (!contact) return;
    setIsLoadingNotes(true);
    try {
      await fetchContactNotes(contact.id);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [contact, fetchContactNotes]);

  useEffect(() => {
    if (contact) {
      loadIdentifiers();
      loadRelationships();
      loadPreferences();
      loadAliases();
      loadTimeline();
      loadNotes();
    }
  }, [contact, loadIdentifiers, loadRelationships, loadPreferences, loadAliases, loadTimeline, loadNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      await addContactNote(contact.id, { note: newNoteText.trim() });
      setNewNoteText('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!contact) return;
    try {
      await deleteContactNote(contact.id, noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const createIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError('');

    if (!newIdentifier.value.trim()) {
      setIdentifierError('Identifier value is required.');
      return;
    }

    try {
      const response = await apiClient.post(`/v1/contacts/${contact?.id}/identifiers`, newIdentifier);
      setIdentifiers((current) => [...current, response.data.data]);
      setNewIdentifier({ type: 'email', value: '', trusted: true });
      addNotification('success', 'Identifier added');
    } catch (error) {
      console.error('Failed to create identifier:', error);
      addNotification('error', 'Failed to create identifier');
    }
  };

  const deleteIdentifier = async (identifierId: number) => {
    if (!contact) return;

    try {
      await apiClient.delete(`/v1/contacts/${contact.id}/identifiers/${identifierId}`);
      setIdentifiers((current) => current.filter((item) => item.id !== identifierId));
      addNotification('success', 'Identifier removed');
    } catch (error) {
      console.error('Failed to delete identifier:', error);
      addNotification('error', 'Failed to delete identifier');
    }
  };

  const createRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setRelationshipError('');

    if (!newRelationship.related_contact_id) {
      setRelationshipError('Related contact is required.');
      return;
    }

    try {
      const response = await apiClient.post(`/v1/contacts/${contact?.id}/relationships`, {
        related_contact_id: newRelationship.related_contact_id,
        relationship_type: newRelationship.relationship_type,
        mention_count: newRelationship.mention_count,
        confidence: newRelationship.confidence,
      });
      setRelationships((current) => [...current, response.data.data]);
      setNewRelationship({ related_contact_id: '', relationship_type: 'work', mention_count: 1, confidence: 1.0 });
      addNotification('success', 'Relationship saved');
    } catch (error) {
      console.error('Failed to create relationship:', error);
      addNotification('error', 'Failed to create relationship');
    }
  };

  const deleteRelationship = async (relationshipId: number) => {
    if (!contact) return;

    try {
      await apiClient.delete(`/v1/contacts/${contact.id}/relationships/${relationshipId}`);
      setRelationships((current) => current.filter((item) => item.id !== relationshipId));
      addNotification('success', 'Relationship removed');
    } catch (error) {
      console.error('Failed to delete relationship:', error);
      addNotification('error', 'Failed to delete relationship');
    }
  };

  const createPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreferenceError('');

    if (!newPreference.value.trim()) {
      setPreferenceError('Preference value is required.');
      return;
    }

    try {
      const response = await apiClient.post(`/v1/contacts/${contact?.id}/preferences`, newPreference);
      setPreferences((current) => [...current, response.data.data]);
      setNewPreference({ preference_type: 'channel', value: '', confidence: 1.0, inferred_from_count: 0 });
      addNotification('success', 'Preference saved');
    } catch (error) {
      console.error('Failed to create preference:', error);
      addNotification('error', 'Failed to create preference');
    }
  };

  const deletePreference = async (preferenceId: number) => {
    if (!contact) return;

    try {
      await apiClient.delete(`/v1/contacts/${contact.id}/preferences/${preferenceId}`);
      setPreferences((current) => current.filter((item) => item.id !== preferenceId));
      addNotification('success', 'Preference removed');
    } catch (error) {
      console.error('Failed to delete preference:', error);
      addNotification('error', 'Failed to delete preference');
    }
  };

  const createAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    setAliasError('');

    if (!newAlias.alias_name.trim()) {
      setAliasError('Alias name is required.');
      return;
    }

    try {
      const response = await apiClient.post(`/v1/contacts/${contact?.id}/aliases`, newAlias);
      setAliases((current) => [...current, response.data.data]);
      setNewAlias({ alias_name: '', confidence: 1.0, created_context: '' });
      addNotification('success', 'Alias added');
    } catch (error) {
      console.error('Failed to create alias:', error);
      addNotification('error', 'Failed to create alias');
    }
  };

  const deleteAlias = async (aliasId: number) => {
    if (!contact) return;

    try {
      await apiClient.delete(`/v1/contacts/${contact.id}/aliases/${aliasId}`);
      setAliases((current) => current.filter((item) => item.id !== aliasId));
      addNotification('success', 'Alias removed');
    } catch (error) {
      console.error('Failed to delete alias:', error);
      addNotification('error', 'Failed to delete alias');
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    try {
      await updateContact(contact.id, editForm);
      addJob?.(`Synchronizing updated profile telemetry: ${contact.name}`);
      setIsEditDrawerOpen(false);
    } catch (error) {
      console.error('Failed to update contact:', error);
      addNotification('error', 'Failed to update contact');
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    try {
      await deleteContact(contact.id);
      setIsDeleteModalOpen(false);
      router.replace('/contacts');
    } catch (error) {
      console.error('Failed to delete contact:', error);
      addNotification('error', 'Failed to delete contact');
    }
  };

  if (!contact) {
    return (
      <AppLayout>
        <div className="p-6 h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400 font-mono text-xs">Loading Intelligence Profile...</div>
        </div>
      </AppLayout>
    );
  }

  // timelineEvents and notes are derived from the store (see declarations above)

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-y-auto animate-in fade-in duration-300">
        <div className="p-6 max-w-5xl mx-auto w-full space-y-6">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-4 text-sm">
            <Link href="/contacts" className="text-gray-400 hover:text-nexus-blue transition-colors flex items-center gap-1.5 font-mono text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Contacts
            </Link>
          </div>

          {/* Hero Profile Card */}
          <NxGlassCard className="p-0 overflow-hidden relative">
            {/* Header Blur element */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-nexus-blue/10 to-transparent pointer-events-none" />

            <div className="p-8 pb-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/20 bg-black/50 overflow-hidden shadow-2xl shrink-0 p-1">
                <div className="w-full h-full rounded-full bg-surface-dark overflow-hidden relative flex items-center justify-center">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-100">{contact.name}</h1>
                    <p className="text-nexus-blue font-medium mt-1">{contact.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <NxActionButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditDrawerOpen(true)}
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </NxActionButton>
                    <NxActionButton
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error/10 hover:text-error"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </NxActionButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-white/5">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span>{contact.company}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </NxGlassCard>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/5">
            {[
              { value: 'timeline', label: 'Timeline', icon: <Activity className="w-4 h-4" /> },
              { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
              { value: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
              { value: 'identifiers', label: 'Identifiers', icon: <Link2 className="w-4 h-4" /> },
              { value: 'relationships', label: 'Relationships', icon: <Users className="w-4 h-4" /> },
              { value: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
              { value: 'aliases', label: 'Aliases', icon: <User className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === tab.value ? 'border-nexus-blue text-nexus-blue' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          <div className="mt-4 space-y-4">
            {activeTab === 'timeline' && (
              <NxGlassCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">Interaction Logs</h2>
                  {isLoadingTimeline && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>
                {timelineEvents.length === 0 && !isLoadingTimeline ? (
                  <div className="text-sm text-gray-400 text-center py-8">No interaction history recorded yet.</div>
                ) : (
                  <NxRelationTimeline events={timelineEvents} />
                )}
              </NxGlassCard>
            )}

            {activeTab === 'analytics' && (
              <NxGlassCard className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Contact Analytics</h2>
                  {isLoadingAnalytics && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>

                {analytics ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <NxMetricCard
                        title="Memories"
                        value={analytics.memory_count.toString()}
                        icon={<MessageSquare className="w-5 h-5" />}
                        trend="neutral"
                      />
                      <NxMetricCard
                        title="Tags"
                        value={analytics.tag_count.toString()}
                        icon={<Users className="w-5 h-5" />}
                        trend="neutral"
                      />
                      <NxMetricCard
                        title="Rules"
                        value={analytics.rule_count.toString()}
                        icon={<Activity className="w-5 h-5" />}
                        trend="neutral"
                      />
                      <NxMetricCard
                        title="Baseline"
                        value={analytics.baseline}
                        icon={<BarChart3 className="w-5 h-5" />}
                        trend={analytics.baseline === 'positive' ? 'up' : analytics.baseline === 'negative' ? 'down' : 'neutral'}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Last seen: {analytics.last_seen_at ? new Date(analytics.last_seen_at).toLocaleString() : 'Never'}</span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-300">Activity Timeline</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-xs font-semibold text-gray-400 mb-3">Memories</h4>
                          <div className="space-y-2">
                            {analytics.time_series.memories.slice(-7).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-500">{item.date}</span>
                                <span className="text-nexus-blue font-mono">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-xs font-semibold text-gray-400 mb-3">Messages</h4>
                          <div className="space-y-2">
                            {analytics.time_series.messages.slice(-7).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-500">{item.date}</span>
                                <span className="text-nexus-blue font-mono">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-xs font-semibold text-gray-400 mb-3">Conversations</h4>
                          <div className="space-y-2">
                            {analytics.time_series.conversations.slice(-7).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-500">{item.date}</span>
                                <span className="text-nexus-blue font-mono">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No analytics data available
                  </div>
                )}
              </NxGlassCard>
            )}

            {activeTab === 'notes' && (
              <NxGlassCard className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">System Notes</h2>
                  {isLoadingNotes && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>

                {/* Add note form */}
                <form onSubmit={handleAddNote} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Append new note</label>
                    <NxInput
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add a cognitive note or observation..."
                    />
                  </div>
                  <NxActionButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    leftIcon={isAddingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  >
                    Append
                  </NxActionButton>
                </form>

                {/* Notes list */}
                <div className="space-y-3">
                  {notes.length === 0 && !isLoadingNotes ? (
                    <div className="text-sm text-gray-400 text-center py-6">No notes recorded yet. Append the first one.</div>
                  ) : notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 group hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-nexus-blue font-semibold flex items-center gap-1.5">
                          {note.is_pinned && <Pin className="w-3 h-3" />}
                          {note.summary ? note.summary.toUpperCase() : 'NOTE'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed font-sans">{note.note}</p>
                    </div>
                  ))}
                </div>
              </NxGlassCard>
            )}

            {activeTab === 'identifiers' && (
              <NxGlassCard className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Contact Identifiers</h2>
                  {isLoadingIdentifiers && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>
                <form onSubmit={createIdentifier} className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Identifier Type</label>
                    <select
                      value={newIdentifier.type}
                      onChange={(e) => setNewIdentifier({ ...newIdentifier, type: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-gray-200"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="external_id">External ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Value</label>
                    <NxInput
                      value={newIdentifier.value}
                      onChange={(e) => setNewIdentifier({ ...newIdentifier, value: e.target.value })}
                      placeholder="identifier value"
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={newIdentifier.trusted}
                        onChange={(e) => setNewIdentifier({ ...newIdentifier, trusted: e.target.checked })}
                        className="rounded border-white/10 bg-black/70 text-nexus-blue"
                      />
                      Trusted
                    </div>
                    <NxActionButton type="submit" variant="primary" size="sm">
                      Save Identifier
                    </NxActionButton>
                  </div>
                </form>
                {identifierError && <div className="text-xs text-red-300">{identifierError}</div>}
                <div className="grid gap-3">
                  {identifiers.length === 0 ? (
                    <div className="text-sm text-gray-400">No identifiers have been registered yet.</div>
                  ) : identifiers.map((identifier) => (
                    <div key={identifier.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-sm text-gray-200 font-semibold">{identifier.type.toUpperCase()}</p>
                        <p className="text-xs text-gray-400 break-all">{identifier.value}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span>{identifier.trusted ? 'Trusted' : 'Untrusted'}</span>
                        <NxActionButton type="button" variant="secondary" size="sm" onClick={() => deleteIdentifier(identifier.id)}>
                          Remove
                        </NxActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </NxGlassCard>
            )}

            {activeTab === 'relationships' && (
              <NxGlassCard className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Contact Relationships</h2>
                  {isLoadingRelationships && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>
                <form onSubmit={createRelationship} className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Related Contact</label>
                    <select
                      value={newRelationship.related_contact_id}
                      onChange={(e) => setNewRelationship({ ...newRelationship, related_contact_id: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-gray-200"
                    >
                      <option value="">Select contact</option>
                      {contacts.filter((c) => c.id !== contact.id).map((target) => (
                        <option key={target.id} value={target.id}>{target.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Relationship Type</label>
                    <select
                      value={newRelationship.relationship_type}
                      onChange={(e) => setNewRelationship({ ...newRelationship, relationship_type: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-gray-200"
                    >
                      <option value="work">Work</option>
                      <option value="family">Family</option>
                      <option value="social">Social</option>
                      <option value="vendor">Vendor</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <NxInput
                        type="number"
                        value={newRelationship.mention_count}
                        onChange={(e) => setNewRelationship({ ...newRelationship, mention_count: Number(e.target.value) })}
                        placeholder="Mentions"
                      />
                      <NxInput
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={newRelationship.confidence}
                        onChange={(e) => setNewRelationship({ ...newRelationship, confidence: Number(e.target.value) })}
                        placeholder="Confidence"
                      />
                    </div>
                    <NxActionButton type="submit" variant="primary" size="sm">
                      Link Relationship
                    </NxActionButton>
                  </div>
                </form>
                {relationshipError && <div className="text-xs text-red-300">{relationshipError}</div>}
                <div className="space-y-3">
                  {relationships.length === 0 ? (
                    <div className="text-sm text-gray-400">No relationships registered yet.</div>
                  ) : relationships.map((relationship) => (
                    <div key={relationship.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-sm text-gray-200 font-semibold">{relationship.related_contact?.name || 'Unknown contact'}</p>
                        <p className="text-xs text-gray-400">{relationship.relationship_type} · {relationship.confidence.toFixed(2)} confidence · {relationship.mention_count} mentions</p>
                      </div>
                      <NxActionButton type="button" variant="secondary" size="sm" onClick={() => deleteRelationship(relationship.id)}>
                        Remove
                      </NxActionButton>
                    </div>
                  ))}
                </div>
              </NxGlassCard>
            )}

            {activeTab === 'preferences' && (
              <NxGlassCard className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Contact Preferences</h2>
                  {isLoadingPreferences && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>
                <form onSubmit={createPreference} className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Preference Type</label>
                    <select
                      value={newPreference.preference_type}
                      onChange={(e) => setNewPreference({ ...newPreference, preference_type: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-gray-200"
                    >
                      <option value="channel">Channel</option>
                      <option value="tone">Tone</option>
                      <option value="timezone">Timezone</option>
                      <option value="language">Language</option>
                      <option value="opt_out">Opt-Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Value</label>
                    <NxInput
                      value={newPreference.value}
                      onChange={(e) => setNewPreference({ ...newPreference, value: e.target.value })}
                      placeholder="Preference value"
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-3">
                    <NxActionButton type="submit" variant="primary" size="sm">
                      Save Preference
                    </NxActionButton>
                  </div>
                </form>
                {preferenceError && <div className="text-xs text-red-300">{preferenceError}</div>}
                <div className="space-y-3">
                  {preferences.length === 0 ? (
                    <div className="text-sm text-gray-400">No preference data recorded yet.</div>
                  ) : preferences.map((preference) => (
                    <div key={preference.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-sm text-gray-200 font-semibold">{preference.preference_type}</p>
                        <p className="text-xs text-gray-400">{preference.value} · {preference.confidence.toFixed(2)} confidence</p>
                      </div>
                      <NxActionButton type="button" variant="secondary" size="sm" onClick={() => deletePreference(preference.id)}>
                        Delete
                      </NxActionButton>
                    </div>
                  ))}
                </div>
              </NxGlassCard>
            )}

            {activeTab === 'aliases' && (
              <NxGlassCard className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Contact Aliases</h2>
                  {isLoadingAliases && <Loader2 className="w-5 h-5 animate-spin text-nexus-blue" />}
                </div>
                <form onSubmit={createAlias} className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Alias Name</label>
                    <NxInput
                      value={newAlias.alias_name}
                      onChange={(e) => setNewAlias({ ...newAlias, alias_name: e.target.value })}
                      placeholder="Alias name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Context</label>
                    <NxInput
                      value={newAlias.created_context || ''}
                      onChange={(e) => setNewAlias({ ...newAlias, created_context: e.target.value })}
                      placeholder="Context or source"
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-3">
                    <NxActionButton type="submit" variant="primary" size="sm">
                      Add Alias
                    </NxActionButton>
                  </div>
                </form>
                {aliasError && <div className="text-xs text-red-300">{aliasError}</div>}
                <div className="space-y-3">
                  {aliases.length === 0 ? (
                    <div className="text-sm text-gray-400">No aliases have been discovered yet.</div>
                  ) : aliases.map((alias) => (
                    <div key={alias.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-sm text-gray-200 font-semibold">{alias.alias_name}</p>
                        <p className="text-xs text-gray-400">{alias.created_context || 'No context'} · confidence {alias.confidence.toFixed(2)}</p>
                      </div>
                      <NxActionButton type="button" variant="secondary" size="sm" onClick={() => deleteAlias(alias.id)}>
                        Remove
                      </NxActionButton>
                    </div>
                  ))}
                </div>
              </NxGlassCard>
            )}
          </div>

        </div>

        {/* Edit Profile Drawer */}
        <NxDrawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} title="Modify Relationship Parameters">
          <form onSubmit={saveEdit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Full Name</label>
              <NxInput
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Corporate Role</label>
              <NxInput
                value={editForm.role || ""}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Organization</label>
              <NxInput
                value={editForm.company || ""}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Direct Email</label>
              <NxInput
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Secure Phone</label>
              <NxInput
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                required
              />
            </div>

            <div className="flex md:justify-end gap-3 mt-4 border-t border-white/5 pt-4">
              <NxActionButton type="button" variant="secondary" onClick={() => setIsEditDrawerOpen(false)}>
                Cancel
              </NxActionButton>

              <NxActionButton type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </NxActionButton>
            </div>
          </form>
        </NxDrawer>

        {/* Delete Confirmation Drawer / Modal equivalence */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <NxGlassCard className="p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-error">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="font-bold text-gray-100 text-lg">Purge Profile?</span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Are you sure you want to permanently delete <strong className="text-white">{contact.name}</strong> from your local relation workspace database? This action is irreversible.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <NxActionButton variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                  Hold Back
                </NxActionButton>

                <NxActionButton variant="primary" size="sm" className="bg-error hover:bg-error/80 border-error" onClick={handleDelete}>
                  Deconstruct Profile
                </NxActionButton>
              </div>
            </NxGlassCard>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
