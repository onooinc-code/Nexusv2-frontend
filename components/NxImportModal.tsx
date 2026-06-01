"use client";

import React, { useState } from 'react';
import { NxModal } from '@/components/NxModal';
import { NxActionButton } from '@/components/NxActionButton';
import { NxInput } from '@/components/NxInput';
import { NxSelect } from '@/components/NxSelect';
import { Upload, Smartphone, RefreshCw, X, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { addNotification } from '@/store/store-provider';

interface NxImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
}

export const NxImportModal = ({ isOpen, onClose, contactId }: NxImportModalProps) => {
  const [tab, setTab] = useState<'file' | 'waha'>('file');
  const [source, setSource] = useState<'whatsapp' | 'facebook'>('whatsapp');
  const [file, setFile] = useState<File | null>(null);
  
  // WAHA Sync State
  const [wahaSession, setWahaSession] = useState('default');
  const [wahaChatId, setWahaChatId] = useState('');
  const [wahaLimit, setWahaLimit] = useState('100');

  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportFile = async () => {
    if (!file) {
      addNotification('error', 'Please select a file to import');
      return;
    }

    setIsImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append('contact_id', contactId.toString());
    formData.append('file', file);
    
    const format = file.name.endsWith('.json') ? 'json' : 'txt';
    formData.append('format', format);

    try {
      const response = await apiClient.post(`/v1/contacts/import/${source}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.data);
      addNotification('success', 'Import successful!');
    } catch (error: any) {
      addNotification('error', error.response?.data?.error || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleWahaSync = async () => {
    if (!wahaChatId) {
      addNotification('error', 'Please enter a WAHA Chat ID');
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const response = await apiClient.post('/v1/contacts/import/whatsapp/waha', {
        contact_id: contactId,
        session: wahaSession,
        chat_id: wahaChatId,
        limit: parseInt(wahaLimit, 10),
      });

      setResult(response.data.data);
      addNotification('success', 'Live sync successful!');
    } catch (error: any) {
      addNotification('error', error.response?.data?.error || 'Sync failed');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <NxModal isOpen={isOpen} onClose={onClose} title="Import Contact Messages" size="md">
      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'file' ? 'bg-nexus-blue/20 text-blue-100 border border-nexus-blue/30' : 'text-gray-400 hover:text-gray-100'
            }`}
            onClick={() => { setTab('file'); setResult(null); }}
          >
            <Upload className="w-4 h-4" /> File Import
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'waha' ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30' : 'text-gray-400 hover:text-gray-100'
            }`}
            onClick={() => { setTab('waha'); setResult(null); }}
          >
            <Smartphone className="w-4 h-4" /> WAHA Live Sync
          </button>
        </div>

        {!result ? (
          <>
            {tab === 'file' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Source</label>
                  <NxSelect
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    options={[
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'facebook', label: 'Facebook' },
                    ]}
                  />
                </div>
                
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center bg-black/20">
                  <Upload className="w-8 h-8 text-gray-500 mb-3" />
                  <p className="text-sm text-gray-300 mb-4">Drag and drop your exported chat file here</p>
                  <input
                    type="file"
                    accept=".txt,.json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <div className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-white/5 text-gray-100 hover:bg-white/10 cursor-pointer border border-white/10 transition-colors">
                      Browse Files
                    </div>
                  </label>
                  {file && <p className="mt-4 text-xs text-blue-400">{file.name}</p>}
                </div>

                <div className="flex justify-end mt-2">
                  <NxActionButton variant="primary" onClick={handleImportFile} disabled={isImporting || !file}>
                    {isImporting ? 'Importing...' : 'Start Import'}
                  </NxActionButton>
                </div>
              </div>
            )}

            {tab === 'waha' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">WAHA Session ID</label>
                  <NxInput
                    value={wahaSession}
                    onChange={(e) => setWahaSession(e.target.value)}
                    placeholder="e.g. default"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Chat ID</label>
                  <NxInput
                    value={wahaChatId}
                    onChange={(e) => setWahaChatId(e.target.value)}
                    placeholder="e.g. 1234567890@c.us"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Message Limit</label>
                  <NxInput
                    type="number"
                    value={wahaLimit}
                    onChange={(e) => setWahaLimit(e.target.value)}
                    placeholder="100"
                  />
                </div>

                <div className="flex justify-end mt-2">
                  <NxActionButton variant="primary" onClick={handleWahaSync} disabled={isImporting || !wahaChatId}>
                    {isImporting ? 'Syncing...' : 'Start Live Sync'}
                  </NxActionButton>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-100 mb-2">Import Successful</h3>
            
            <div className="w-full grid grid-cols-2 gap-4 mt-4">
              <div className="bg-black/40 p-3 rounded-lg flex flex-col items-center">
                <span className="text-2xl font-semibold text-blue-400">{result.created}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Created</span>
              </div>
              <div className="bg-black/40 p-3 rounded-lg flex flex-col items-center">
                <span className="text-2xl font-semibold text-gray-400">{result.duplicates}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Duplicates</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <NxActionButton variant="secondary" onClick={() => setResult(null)}>
                Import More
              </NxActionButton>
              <NxActionButton variant="primary" onClick={onClose}>
                Done
              </NxActionButton>
            </div>
          </div>
        )}
      </div>
    </NxModal>
  );
};
