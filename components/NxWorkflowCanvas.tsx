import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowsStore } from '../hooks/useWorkflowsStore';

interface NxWorkflowCanvasProps {
  workflowId: string;
}

export function NxWorkflowCanvas({ workflowId }: NxWorkflowCanvasProps) {
  const { definition, fetchWorkflowDefinition, isLoading } = useWorkflowsStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflowDefinition(workflowId);
    }
  }, [workflowId, fetchWorkflowDefinition]);

  useEffect(() => {
    if (definition?.steps) {
      // Very basic auto-layout for linear workflows
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      definition.steps.forEach((step, index) => {
        const nodeId = step.id || `step_${index}`;
        newNodes.push({
          id: nodeId,
          position: { x: 250, y: index * 150 + 50 },
          data: { label: step.name || step.type || 'Action' },
          type: 'default',
        });

        if (index > 0) {
          const prevId = definition.steps[index - 1].id || `step_${index - 1}`;
          newEdges.push({
            id: `e-${prevId}-${nodeId}`,
            source: prevId,
            target: nodeId,
            animated: true,
            style: { stroke: '#3b82f6' }
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [definition, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center p-8 text-neutral-400">Loading Canvas...</div>;
  }

  return (
    <div className="w-full h-[600px] border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls className="bg-neutral-900 border-neutral-800 fill-neutral-300" />
        <MiniMap 
          nodeColor="#3b82f6" 
          maskColor="rgba(0, 0, 0, 0.5)"
          className="bg-neutral-900 border border-neutral-800" 
        />
        <Background color="#262626" gap={16} />
        <Panel position="top-right" className="bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-xs text-neutral-300 shadow-xl">
          Workflow Editor (Read Only Preview)
        </Panel>
      </ReactFlow>
    </div>
  );
}
