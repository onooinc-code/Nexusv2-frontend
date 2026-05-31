"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { NxDrawer } from '@/components/NxDrawer';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxActionButton } from '@/components/NxActionButton';
import { NxStatusBadge } from '@/components/NxStatusBadge';
import { useAppStore } from '@/store/store-provider';
import { X, Bell, Mail, MessageSquare, Smartphone, RefreshCw, Trash2, Check, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface NotificationLog {
    id: number;
    contact_id: number | null;
    channel: string;
    recipient: string;
    template_key: string | null;
    subject: string | null;
    body: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    retry_count: number;
    error_message: string | null;
    created_at: string;
    contact?: {
        id: number;
        name: string;
        avatar_url: string | null;
    };
}

interface NotificationTemplate {
    id: number;
    key: string;
    name: string;
    subject: string | null;
    body: string;
    channels: string[];
    created_at: string;
    updated_at: string;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    whatsapp: <MessageSquare className="w-4 h-4" />,
    push: <Smartphone className="w-4 h-4" />,
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
    sent: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Check className="w-3 h-3" />, label: 'Sent' },
    delivered: { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle className="w-3 h-3" />, label: 'Delivered' },
    failed: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <AlertTriangle className="w-3 h-3" />, label: 'Failed' },
};

export default function NxNotificationDrawer() {
    const isDrawerOpen = useAppStore((state) => state.isNotificationDrawerOpen);
    const setDrawerOpen = useAppStore((state) => state.setNotificationDrawerOpen);
    const addNotification = useAppStore((state) => state.addNotification);

    const [activeTab, setActiveTab] = useState<'logs' | 'templates'>('logs');
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [filterChannel, setFilterChannel] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    // Send notification form state
    const [isSendFormOpen, setIsSendFormOpen] = useState(false);
    const [sendForm, setSendForm] = useState({
        contact_id: '',
        channel: 'email',
        recipient: '',
        template_key: '',
        subject: '',
        body: '',
    });
    const [isSending, setIsSending] = useState(false);

    const fetchLogs = useCallback(async () => {
        setIsLoadingLogs(true);
        try {
            const params = new URLSearchParams();
            if (filterChannel) params.append('channel', filterChannel);
            if (filterStatus) params.append('status', filterStatus);

            const response = await apiClient.get(`/v1/notifications/logs?${params.toString()}`);
            const data = response.data.data || response.data;
            setLogs(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Failed to fetch notification logs:', error);
            addNotification('error', 'Failed to load notification logs');
        } finally {
            setIsLoadingLogs(false);
        }
    }, [addNotification, filterChannel, filterStatus]);

    const fetchTemplates = useCallback(async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await apiClient.get('/v1/notifications/templates');
            const data = response.data.data || response.data;
            setTemplates(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            addNotification('error', 'Failed to load templates');
        } finally {
            setIsLoadingTemplates(false);
        }
    }, [addNotification]);

    useEffect(() => {
        const load = async () => {
            if (!isDrawerOpen) return;
            if (activeTab === 'logs') {
                await fetchLogs();
            } else {
                await fetchTemplates();
            }
        };
        void load();
    }, [isDrawerOpen, activeTab, fetchLogs, fetchTemplates]);

    const handleRetry = async (logId: number) => {
        try {
            await apiClient.post(`/v1/notifications/${logId}/retry`);
            addNotification('success', 'Notification queued for retry');
            fetchLogs();
        } catch (error) {
            console.error('Failed to retry notification:', error);
            addNotification('error', 'Failed to retry notification');
        }
    };

    const handleDeleteLog = async (logId: number) => {
        try {
            await apiClient.delete(`/v1/notifications/logs/${logId}`);
            addNotification('success', 'Notification log deleted');
            fetchLogs();
        } catch (error) {
            console.error('Failed to delete log:', error);
            addNotification('error', 'Failed to delete log');
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sendForm.recipient || !sendForm.body) {
            addNotification('error', 'Recipient and body are required');
            return;
        }

        setIsSending(true);
        try {
            await apiClient.post('/v1/notifications/send', {
                contact_id: sendForm.contact_id || null,
                channel: sendForm.channel,
                recipient: sendForm.recipient,
                template_key: sendForm.template_key || null,
                subject: sendForm.subject || null,
                body: sendForm.body,
            });
            addNotification('success', 'Notification sent successfully');
            setIsSendFormOpen(false);
            setSendForm({ contact_id: '', channel: 'email', recipient: '', template_key: '', subject: '', body: '' });
            fetchLogs();
        } catch (error) {
            console.error('Failed to send notification:', error);
            addNotification('error', 'Failed to send notification');
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteTemplate = async (templateId: number) => {
        try {
            await apiClient.delete(`/v1/notifications/templates/${templateId}`);
            addNotification('success', 'Template deleted');
            fetchTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            addNotification('error', 'Failed to delete template');
        }
    };

    return (
        <NxDrawer
            isOpen={isDrawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Notification Hub"
            className="max-w-2xl"
        >
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/5 mb-4">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer
              ${activeTab === 'logs' ? 'border-nexus-blue text-nexus-blue' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        <Bell className="w-4 h-4" /> Notification Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer
              ${activeTab === 'templates' ? 'border-nexus-blue text-nexus-blue' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        <Mail className="w-4 h-4" /> Templates
                    </button>
                </div>

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Filters */}
                        <div className="flex gap-2 mb-4">
                            <select
                                value={filterChannel}
                                onChange={(e) => setFilterChannel(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-nexus-blue"
                            >
                                <option value="">All Channels</option>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="push">Push</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-nexus-blue"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed</option>
                            </select>
                            <NxActionButton
                                variant="secondary"
                                size="sm"
                                onClick={fetchLogs}
                                leftIcon={<RefreshCw className="w-3 h-3" />}
                            >
                                Refresh
                            </NxActionButton>
                            <NxActionButton
                                variant="primary"
                                size="sm"
                                onClick={() => setIsSendFormOpen(!isSendFormOpen)}
                                leftIcon={<Bell className="w-3 h-3" />}
                            >
                                Send New
                            </NxActionButton>
                        </div>

                        {/* Send Form */}
                        {isSendFormOpen && (
                            <NxGlassCard className="p-4 mb-4 space-y-3">
                                <h3 className="text-sm font-semibold text-white">Send Notification</h3>
                                <form onSubmit={handleSendNotification} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Channel</label>
                                            <select
                                                value={sendForm.channel}
                                                onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-nexus-blue"
                                            >
                                                <option value="email">Email</option>
                                                <option value="sms">SMS</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="push">Push</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Recipient</label>
                                            <input
                                                type="text"
                                                value={sendForm.recipient}
                                                onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                                                placeholder="email@example.com or +1234567890"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-nexus-blue"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Subject (optional)</label>
                                        <input
                                            type="text"
                                            value={sendForm.subject}
                                            onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                                            placeholder="Notification subject"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-nexus-blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Message Body</label>
                                        <textarea
                                            value={sendForm.body}
                                            onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                                            placeholder="Enter notification message..."
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-nexus-blue resize-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <NxActionButton type="button" variant="secondary" size="sm" onClick={() => setIsSendFormOpen(false)}>
                                            Cancel
                                        </NxActionButton>
                                        <NxActionButton type="submit" variant="primary" size="sm" isLoading={isSending}>
                                            Send Notification
                                        </NxActionButton>
                                    </div>
                                </form>
                            </NxGlassCard>
                        )}

                        {/* Logs List */}
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {isLoadingLogs ? (
                                <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No notification logs found</div>
                            ) : (
                                logs.map((log) => {
                                    const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
                                    return (
                                        <NxGlassCard key={log.id} className="p-3 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="text-nexus-blue shrink-0">
                                                        {CHANNEL_ICONS[log.channel] || <Bell className="w-4 h-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-gray-200 truncate">
                                                            {log.subject || log.body.substring(0, 50) + '...'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 truncate">
                                                            To: {log.recipient}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.color}`}>
                                                        {statusConfig.icon} {statusConfig.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                <span className="capitalize">{log.channel}</span>
                                                <span>{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            {log.error_message && (
                                                <p className="text-[10px] text-red-400 bg-red-500/10 rounded p-1.5">
                                                    {log.error_message}
                                                </p>
                                            )}
                                            <div className="flex justify-end gap-1 pt-1 border-t border-white/5">
                                                {log.status === 'failed' && log.retry_count < 3 && (
                                                    <NxActionButton
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRetry(log.id)}
                                                        leftIcon={<RefreshCw className="w-3 h-3" />}
                                                        className="text-xs"
                                                    >
                                                        Retry
                                                    </NxActionButton>
                                                )}
                                                <NxActionButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteLog(log.id)}
                                                    leftIcon={<Trash2 className="w-3 h-3" />}
                                                    className="text-xs text-red-400 hover:bg-red-500/10"
                                                >
                                                    Delete
                                                </NxActionButton>
                                            </div>
                                        </NxGlassCard>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-gray-400">{templates.length} templates</span>
                            <NxActionButton
                                variant="primary"
                                size="sm"
                                onClick={() => addNotification('info', 'Template creation coming soon')}
                                leftIcon={<Bell className="w-3 h-3" />}
                            >
                                New Template
                            </NxActionButton>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {isLoadingTemplates ? (
                                <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No templates found</div>
                            ) : (
                                templates.map((template) => (
                                    <NxGlassCard key={template.id} className="p-3 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-200">{template.name}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{template.key}</p>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                {template.channels.map((channel) => (
                                                    <span
                                                        key={channel}
                                                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-nexus-blue/10 text-nexus-blue border border-nexus-blue/20 capitalize"
                                                    >
                                                        {channel}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {template.subject && (
                                            <p className="text-[10px] text-gray-400">Subject: {template.subject}</p>
                                        )}
                                        <p className="text-[10px] text-gray-500 line-clamp-2">{template.body}</p>
                                        <div className="flex justify-end gap-1 pt-1 border-t border-white/5">
                                            <NxActionButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addNotification('info', 'Template editing coming soon')}
                                                className="text-xs"
                                            >
                                                Edit
                                            </NxActionButton>
                                            <NxActionButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                leftIcon={<Trash2 className="w-3 h-3" />}
                                                className="text-xs text-red-400 hover:bg-red-500/10"
                                            >
                                                Delete
                                            </NxActionButton>
                                        </div>
                                    </NxGlassCard>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </NxDrawer>
    );
}