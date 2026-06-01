"use client";

import React, { useState, useEffect } from 'react';
import { NxGlassCard } from './NxGlassCard';
import { NxActionButton } from './NxActionButton';
import { ListChecks, Plus, Trash2, Check, X, Loader2, Brain } from 'lucide-react';

interface NxRulesViewerProps {
  contactId: number;
}

export const NxRulesViewer: React.FC<NxRulesViewerProps> = ({ contactId }) => {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newRule, setNewRule] = useState('');

  // Mocking AI suggestions
  const [suggestions, setSuggestions] = useState<any[]>([
    { id: 's1', text: 'Do not contact on weekends', confidence: 0.95 },
    { id: 's2', text: 'Prefers concise emails with bullet points', confidence: 0.88 }
  ]);

  useEffect(() => {
    // In a real implementation, we would fetch from /api/v1/contacts/{id}/rules
    setIsLoading(true);
    setTimeout(() => {
      setRules([
        { id: 1, text: 'Must address as "Dr."' },
        { id: 2, text: 'Only message via WhatsApp for urgent issues' }
      ]);
      setIsLoading(false);
    }, 500);
  }, [contactId]);

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules([...rules, { id: Date.now(), text: newRule }]);
    setNewRule('');
  };

  const handleRemoveRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const acceptSuggestion = (suggestion: any) => {
    setRules([...rules, { id: Date.now(), text: suggestion.text }]);
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
  };

  const rejectSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  return (
    <NxGlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-nexus-blue" />
          Reply Rules & Guidelines
        </h3>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-8 space-y-3">
          <h4 className="text-sm font-semibold text-nexus-blue flex items-center gap-2">
            <Brain className="w-4 h-4" /> AI Suggested Rules
          </h4>
          <div className="grid gap-3">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="flex items-center justify-between p-3 rounded-lg bg-nexus-blue/5 border border-nexus-blue/20">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-200">{suggestion.text}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Confidence: {(suggestion.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => acceptSuggestion(suggestion)} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => rejectSuggestion(suggestion.id)} className="p-1.5 bg-error/20 text-error rounded hover:bg-error/40 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Add a new custom rule..."
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-nexus-blue/50 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
          />
          <NxActionButton variant="primary" onClick={handleAddRule}>
            <Plus className="w-4 h-4" /> Add
          </NxActionButton>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-nexus-blue" />
          </div>
        ) : (
          <ul className="space-y-2">
            {rules.map(rule => (
              <li key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 group">
                <span className="text-sm text-gray-300">{rule.text}</span>
                <button 
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-gray-500 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
            {rules.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No active rules for this contact.</p>
            )}
          </ul>
        )}
      </div>
    </NxGlassCard>
  );
};
