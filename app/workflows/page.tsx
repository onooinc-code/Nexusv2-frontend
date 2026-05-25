"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { NxWorkflowNode } from '@/components/NxWorkflowNode';
import { NxModal } from '@/components/NxModal';
import { NxInput } from '@/components/NxInput';
import { NxSelect } from '@/components/NxSelect';
import { NxActionButton } from '@/components/NxActionButton';
import { NxGlassCard } from '@/components/NxGlassCard';
import { NxEmptyState } from '@/components/NxEmptyState';
import { 
  GitMerge, 
  Play, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  CornerRightDown 
} from 'lucide-react';

interface NodeItem {
  id: string;
  title: string;
  type: 'trigger' | 'action' | 'condition' | 'agent';
  status: 'pending' | 'running' | 'success' | 'error';
  x: number; // For absolute canvas grids
  y: number;
}

const DEFAULT_NODES: NodeItem[] = [
  { id: "1", title: "Inbound Email Webhook", type: "trigger", status: "pending", x: 40, y: 150 },
  { id: "2", title: "Analyze with Ingestion Alpha", type: "agent", status: "pending", x: 280, y: 150 },
  { id: "3", title: "Verify Sentiment is High", type: "condition", status: "pending", x: 520, y: 150 },
  { id: "4", title: "Draft Response via Outreach", type: "agent", status: "pending", x: 760, y: 150 }
];

export default function WorkflowsPage() {
  const [nodes, setNodes] = useState<NodeItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_workflows');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_NODES;
        }
      }
    }
    return DEFAULT_NODES;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Creation form state
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeType, setNewNodeType] = useState<'trigger' | 'action' | 'condition' | 'agent'>('agent');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_workflows');
      if (!saved) {
        localStorage.setItem('nexus_workflows', JSON.stringify(DEFAULT_NODES));
      }
    }
  }, []);

  const saveToStorage = (updatedNodes: NodeItem[]) => {
    setNodes(updatedNodes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_workflows', JSON.stringify(updatedNodes));
    }
  };

  // Simulate step-by-step runner pipeline
  const runPipelineSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Set all nodes to pending first
    let currentNodes: NodeItem[] = nodes.map(n => ({ ...n, status: 'pending' }));
    setNodes(currentNodes);

    for (let i = 0; i < currentNodes.length; i++) {
       setActiveStep(i);
       // Mark step running
       currentNodes = currentNodes.map((n, idx) => idx === i ? { ...n, status: 'running' } : n);
       setNodes(currentNodes);
       
       // Hold 1.5 seconds per node step
       await new Promise(resolve => setTimeout(resolve, 1400));
       
       // Complete step
       const successChance = Math.random() > 0.1; // 90% success rate
       currentNodes = currentNodes.map((n, idx) => idx === i ? { ...n, status: (successChance ? 'success' as const : 'error' as const) } : n);
       setNodes(currentNodes);

      if (!successChance) {
        // Halt on error
        break;
      }
    }

    setActiveStep(-1);
    setIsRunning(false);
    // Persist finalized statuses
    saveToStorage(currentNodes);
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;

    // Place node dynamically at the coordinate after the last node
    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? lastNode.x + 240 : 40;
    const newY = lastNode ? lastNode.y : 150;

    const newNode: NodeItem = {
      id: String(Date.now()),
      title: newNodeTitle,
      type: newNodeType,
      status: 'pending',
      x: newX,
      y: newY
    };

    const updated = [...nodes, newNode];
    saveToStorage(updated);
    
    // Clear
    setNewNodeTitle("");
    setIsModalOpen(false);
  };

  const clearCanvas = () => {
    saveToStorage([]);
    setActiveStep(-1);
    setIsRunning(false);
  };

  const resetToDefault = () => {
    saveToStorage(DEFAULT_NODES);
    setActiveStep(-1);
    setIsRunning(false);
  };

  return (
    <AppLayout>
      <div className="p-6 h-full flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
        
        {/* Header Module */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-nexus-blue" />
              Workflow Orchestration Canvas
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Model conditional automation paths, configure active agents, and execute background pipelines.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <NxActionButton 
              variant="secondary" 
              size="sm"
              onClick={resetToDefault}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              disabled={isRunning}
            >
              Reset Canvas
            </NxActionButton>
            
            <NxActionButton 
              variant="secondary" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              disabled={isRunning}
            >
              Add Action Node
            </NxActionButton>

            <NxActionButton 
              variant="primary" 
              size="sm"
              onClick={runPipelineSimulation}
              leftIcon={<Play className="w-4 h-4 text-white hover:text-white" />}
              isLoading={isRunning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Execute Pipeline
            </NxActionButton>
          </div>
        </div>

        {/* Visual Canvas Panel */}
        <div className="flex-1 min-h-[460px] bg-black/40 border border-white/10 rounded-2xl relative overflow-x-auto overflow-y-hidden p-6 select-none bg-grid scrollbar-thin">
          
          {nodes.length > 0 ? (
            <div className="relative w-max h-full min-w-full flex items-center gap-0">
              {/* Render connector lines using absolute SVGs behind the nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '1200px' }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00a8ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#9b51e0" stopOpacity="0.4" />
                  </linearGradient>
                  
                  <linearGradient id="lineGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#cf00ff" />
                    <stop offset="100%" stopColor="#00cbff" />
                  </linearGradient>
                </defs>
                
                {nodes.map((node, i) => {
                  if (i === nodes.length - 1) return null;
                  const nextNode = nodes[i + 1];
                  const x1 = node.x + 192; // right edge of card container
                  const y1 = node.y + 44;  // middle height of node container
                  const x2 = nextNode.x;   // left edge of next card container
                  const y2 = nextNode.y + 44;
                  
                  const isCurrentConnecting = activeStep === i;

                  return (
                    <g key={`flow-${node.id}`}>
                      {/* Sub-line glow effect */}
                      <path 
                        d={`M ${x1} ${y1} L ${x2} ${y2}`} 
                        stroke={isCurrentConnecting ? "url(#lineGradActive)" : "url(#lineGrad)"} 
                        strokeWidth={isCurrentConnecting ? "4" : "2"}
                        className={isCurrentConnecting ? "animate-pulse" : ""}
                        fill="none" 
                      />
                      {/* Flow directional dot */}
                      {isCurrentConnecting && (
                        <circle r="4" fill="#00ffff">
                          <animateMotion 
                            path={`M ${x1} ${y1} L ${x2} ${y2}`} 
                            dur="1.2s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Render actual nodes */}
              <div className="flex gap-20 pr-12 relative z-10 py-24">
                {nodes.map((node, i) => (
                  <div key={node.id} className="relative">
                    <NxWorkflowNode 
                      title={node.title}
                      type={node.type}
                      status={node.status}
                      selected={activeStep === i}
                    />
                    
                    {/* Position identifier */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-gray-500 uppercase">
                      Node 0{i+1}
                    </div>

                    {/* Delete node button */}
                    {!isRunning && (
                      <button 
                        onClick={() => {
                          const updated = nodes.filter(n => n.id !== node.id);
                          saveToStorage(updated);
                        }}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
                        title="Delete node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <NxEmptyState 
                title="Canvas is Empty" 
                description="Populate nodes into the pipeline schema to run simulations."
                icon={<GitMerge className="w-8 h-8 text-gray-500" />}
                action={
                  <NxActionButton variant="primary" size="sm" onClick={resetToDefault}>
                    Populate Template Grid
                  </NxActionButton>
                }
              />
            </div>
          )}

        </div>

        {/* Info Legend Card */}
        <NxGlassCard className="p-4 flex gap-6 items-center flex-wrap bg-white/5 border-white/5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/40 block" />
            <span className="text-gray-400 font-semibold uppercase">Trigger</span>
            <span className="text-gray-500">— Inbound events</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/40 block" />
            <span className="text-gray-400 font-semibold uppercase">Agent</span>
            <span className="text-gray-500">— Cognitive analytics</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded bg-purple-400/20 border border-purple-400/40 block" />
            <span className="text-gray-400 font-semibold uppercase">Condition</span>
            <span className="text-gray-500">— Logic gates</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded bg-blue-400/20 border border-blue-400/40 block" />
            <span className="text-gray-400 font-semibold uppercase">Action</span>
            <span className="text-gray-500">— Webhook pings</span>
          </div>
        </NxGlassCard>

        {/* Add Node modal */}
        <NxModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Install Flow Node"
        >
          <form onSubmit={handleAddNode} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Node Action Description</label>
              <NxInput 
                value={newNodeTitle}
                onChange={e => setNewNodeTitle(e.target.value)}
                placeholder="e.g. Publish slack alert notification..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Node Taxonomy Type</label>
              <NxSelect 
                value={newNodeType}
                onChange={e => setNewNodeType(e.target.value as any)}
              >
                <option value="trigger">TRIGGER - Webhook or schedule launch</option>
                <option value="agent">AGENT - Cognitive model evaluation</option>
                <option value="condition">CONDITION - Value comparison routing gate</option>
                <option value="action">ACTION - Enqueue third-party webhook push</option>
              </NxSelect>
            </div>

            <div className="flex md:justify-end gap-3 mt-4 border-t border-white/5 pt-4">
              <NxActionButton 
                type="button" 
                variant="secondary" 
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </NxActionButton>
              
              <NxActionButton 
                type="submit" 
                variant="primary" 
                size="sm"
              >
                Insert Node
              </NxActionButton>
            </div>
          </form>
        </NxModal>

      </div>
    </AppLayout>
  );
}
