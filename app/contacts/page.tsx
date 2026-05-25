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
import { Users, Search, Plus, User, Building, Mail, Phone, RefreshCw, LayoutGrid, List, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  // Registration form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [formError, setFormError] = useState("");

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      await hydrateContacts();
    } catch (error) {
      console.error('Failed to load contacts:', error);
      addNotification('error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [hydrateContacts, addNotification]);

  useEffect(() => {
    loadContacts();
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
      console.error('Failed to create contact:', error);
      addNotification('error', 'Failed to create contact');
    }
  };

  const handleReload = () => {
    loadContacts();
    addJob?.("Flushing relation directory database");
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
          <div className="py-20 flex justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-mono">Loading contacts...</span>
            </div>
          </div>
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
                            <img
                              src={c.avatar || `https://picsum.photos/seed/${c.id}/80/80`}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
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

      </div>
    </AppLayout>
  );
}
