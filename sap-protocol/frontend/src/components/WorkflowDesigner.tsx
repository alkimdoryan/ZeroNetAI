import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  type Connection,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';

// Basit bileşenler
const NodePalette = () => (
  <div className="p-4 space-y-4">
    <h3 className="font-semibold text-gray-900">Node Kütüphanesi</h3>
    <div className="space-y-2">
      {['trigger', 'agent', 'condition', 'connector'].map(type => (
        <div 
          key={type}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('application/reactflow', type)}
          className="p-3 bg-white border rounded-lg cursor-move hover:shadow-md"
        >
          {type === 'trigger' && '▶ Tetikleyici'}
          {type === 'agent' && '🤖 Agent'}
          {type === 'condition' && '◊ Koşul'}
          {type === 'connector' && '⚡ Bağlayıcı'}
        </div>
      ))}
    </div>
  </div>
);

const PropertiesPanel = ({ selectedNode, onClose }: any) => (
  <div className="p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">Özellikler</h3>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
    </div>
    {selectedNode && (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
          <input 
            type="text" 
            value={selectedNode.data?.label || ''} 
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
          <input 
            type="text" 
            value={selectedNode.type || ''} 
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
      </div>
    )}
  </div>
);

const WorkflowToolbar = () => (
  <div className="flex items-center space-x-2">
    <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
      ▶ Çalıştır
    </button>
    <button className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600">
      💾 Kaydet
    </button>
  </div>
);

// Custom node types - simplified for now
const TriggerNode = ({ data, selected }: any) => (
  <div className={`bg-white border-2 rounded-lg p-4 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">▶</div>
      <span className="font-medium">{data.label}</span>
    </div>
  </div>
);

const AgentNode = ({ data, selected }: any) => (
  <div className={`bg-white border-2 rounded-lg p-4 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">🤖</div>
      <span className="font-medium">{data.label}</span>
    </div>
  </div>
);

const ConditionNode = ({ data, selected }: any) => (
  <div className={`bg-white border-2 rounded-lg p-4 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white">◊</div>
      <span className="font-medium">{data.label}</span>
    </div>
  </div>
);

const ConnectorNode = ({ data, selected }: any) => (
  <div className={`bg-white border-2 rounded-lg p-4 ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">⚡</div>
      <span className="font-medium">{data.label}</span>
    </div>
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  condition: ConditionNode,
  connector: ConnectorNode,
};

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Manuel Başlatma',
      triggerType: 'manual',
      config: {}
    },
  },
];

const initialEdges: Edge[] = [];

export function WorkflowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);

  // Store kullanımını basitleştirelim

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsPropertiesPanelOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setIsPropertiesPanelOpen(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `Yeni ${type}`,
          config: {}
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm shadow-xl border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
              🔄
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Designer</h1>
              <p className="text-gray-600">Görsel olarak workflow'lar tasarlayın ve yönetin</p>
            </div>
          </div>
          <WorkflowToolbar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-white/20 overflow-y-auto">
          <NodePalette />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl" />
            <MiniMap 
              className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl"
              nodeColor="#6366f1"
              maskColor="rgba(255, 255, 255, 0.2)"
            />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {isPropertiesPanelOpen && (
          <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/20 overflow-y-auto">
            <PropertiesPanel 
              selectedNode={selectedNode}
              onClose={() => setIsPropertiesPanelOpen(false)}
              onUpdateNode={(nodeId: string, data: any) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
                  )
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 