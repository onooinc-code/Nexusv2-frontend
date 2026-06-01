"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { NxGlassCard } from './NxGlassCard';
import { MessageCircle, Hash, TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface Topic {
  id: number;
  topic: string;
  mention_count: number;
  mentions_count?: number; // alias from withCount()
  trend?: string;
}

interface NxTopicsViewerProps {
  contactId: number;
}

export const NxTopicsViewer: React.FC<NxTopicsViewerProps> = ({ contactId }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/v1/contacts/${contactId}/topics`);
      const data = (response.data as { data?: Topic[] }).data ?? [];
      setTopics(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load topics.');
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const getMentionCount = (topic: Topic): number =>
    topic.mention_count ?? topic.mentions_count ?? 0;

  const getTrend = (topic: Topic): string => topic.trend ?? 'stable';

  return (
    <NxGlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-nexus-blue" />
          Extracted Topics
        </h3>
        <button
          onClick={fetchTopics}
          className="p-1.5 text-gray-500 hover:text-nexus-blue rounded-lg hover:bg-white/5 transition-colors"
          title="Refresh topics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        These subjects were automatically extracted by Nexus AI based on recent message history.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-nexus-blue" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-error/60" />
          <p className="text-sm text-error/80">{error}</p>
          <button
            onClick={fetchTopics}
            className="text-xs text-nexus-blue hover:underline"
          >
            Try again
          </button>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <Hash className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-500">
            No topics extracted yet. Run an AI analysis to identify conversation topics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-nexus-blue/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-nexus-blue" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-200">{topic.topic}</span>
                  <span className="text-xs text-gray-500">{getMentionCount(topic)} mentions</span>
                </div>
              </div>

              <div className="text-gray-400">
                {getTrend(topic) === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                {getTrend(topic) === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                {getTrend(topic) === 'stable' && <span className="text-xs font-mono text-gray-500">—</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </NxGlassCard>
  );
};
