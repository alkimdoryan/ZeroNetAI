import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type BackgroundVariant,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { designSystem, createTransition } from '../../styles/design-system';
import { BaseNode } from './nodes/BaseNode';
import { NodePalette } from './NodePalette';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid3X3, 
  TreePine, 
  RotateCcw,
  Save,
  Upload,
  Download,
  Play,
  Settings,
  Layers,
  Filter,
  Command,
  Info,
  X,
  FileText
} from 'lucide-react';
import { IDKitWidget, type ISuccessResult, type IErrorState, VerificationLevel } from '@worldcoin/idkit';
import { 
  WORLDID_APP_ID, 
  WORLDID_ACTION_SAVE_WORKFLOW,
  getWorldIDErrorMessage,
  isWorldIDBypassEnabled,
  simulateWorldIDSuccess
} from '../../config/contracts';

// Layout algorithms
import dagre from 'dagre';
import { hierarchy, tree } from 'd3-hierarchy';

// Types
interface WorkflowNode extends Node {
  data: {
    label: string;
    category: 'trigger' | 'agent' | 'condition' | 'connector' | 'logic' | 'utility' | 'http-request' | 'database-query' | 'email-send' | 'notification' | 'loop' | 'delay' | 'transform' | 'error-handler' | 'custom-function' | 'custom';
    status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
    description?: string;
    icon?: React.ReactNode;
    inputs?: number;
    outputs?: number;
    config?: any;
    tags?: string[];
    lastExecution?: Date;
    executionTime?: number;
    layer?: string;
    group?: string;
  };
}

interface WorkflowDesignerProProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: Edge[];
  onSave?: (nodes: WorkflowNode[], edges: Edge[]) => void;
  onLoad?: () => { nodes: WorkflowNode[]; edges: Edge[] };
}

// Node types registry
const nodeTypes = {
  default: BaseNode,
  trigger: BaseNode,
  agent: BaseNode,
  condition: BaseNode,
  connector: BaseNode,
  logic: BaseNode,
  utility: BaseNode,
  // Yeni node türleri
  'http-request': BaseNode,
  'database-query': BaseNode,
  'email-send': BaseNode,
  'notification': BaseNode,
  'loop': BaseNode,
  'delay': BaseNode,
  'transform': BaseNode,
  'error-handler': BaseNode,
  'custom-function': BaseNode,
  custom: BaseNode,
};

// Layout algorithms
const layoutAlgorithms = {
  dagre: (nodes: WorkflowNode[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', align: 'UL', nodesep: 100, ranksep: 150 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 100 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100,
          y: nodeWithPosition.y - 50,
        },
      };
    });
  },

  tree: (nodes: WorkflowNode[], edges: Edge[]) => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const children = new Map<string, string[]>();
    let root: string | null = null;

    // Build hierarchy
    edges.forEach(edge => {
      if (!children.has(edge.source)) {
        children.set(edge.source, []);
      }
      children.get(edge.source)!.push(edge.target);
    });

    // Find root (node with no incoming edges)
    const hasIncoming = new Set(edges.map(e => e.target));
    root = nodes.find(n => !hasIncoming.has(n.id))?.id || nodes[0]?.id;

    if (!root) return nodes;

    const buildHierarchy = (nodeId: string): any => ({
      id: nodeId,
      children: (children.get(nodeId) || []).map(buildHierarchy)
    });

    const hierarchy_data = hierarchy(buildHierarchy(root));
    const treeLayout = tree<any>().size([800, 600]);
    treeLayout(hierarchy_data);

    const positionedNodes = new Map<string, { x: number; y: number }>();
    hierarchy_data.descendants().forEach(d => {
      positionedNodes.set(d.data.id, { x: d.y || 0, y: d.x || 0 });
    });

    return nodes.map(node => ({
      ...node,
      position: positionedNodes.get(node.id) || node.position,
    }));
  },

  grid: (nodes: WorkflowNode[], edges: Edge[]) => {
    const columns = Math.ceil(Math.sqrt(nodes.length));
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % columns) * 250,
        y: Math.floor(index / columns) * 150,
      },
    }));
  },

  circular: (nodes: WorkflowNode[], edges: Edge[]) => {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    return nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      return {
        ...node,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      };
    });
  }
};

function WorkflowDesignerProComponent({ initialNodes = [], initialEdges = [], onSave, onLoad }: WorkflowDesignerProProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [currentLayout, setCurrentLayout] = useState<string>('dagre');
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isWorkflowSaveVerified, setIsWorkflowSaveVerified] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [workflowName, setWorkflowName] = useState<string>('My Workflow');
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on layer visibility
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesLayer = visibleLayers.has(node.data.layer || 'default');
      return matchesLayer;
    });
  }, [nodes, visibleLayers]);

  // Get unique layers
  const layers = useMemo(() => {
    const layerSet = new Set(nodes.map(n => n.data.layer || 'default'));
    return Array.from(layerSet);
  }, [nodes]);

  // Initialize visible layers when layers change
  useEffect(() => {
    if (layers.length > 0 && visibleLayers.size === 0) {
      setVisibleLayers(new Set(layers));
    }
  }, [layers, visibleLayers.size]);

  // WorldID handlers for workflow save
  const handleWorkflowSaveSuccess = (result: ISuccessResult) => {
    console.log('WorldID verification successful for workflow save:', result);
    setSaveError('');
    setIsWorkflowSaveVerified(true);
  };

  const handleWorkflowSaveError = (error: IErrorState) => {
    console.error('WorldID verification hatası:', error);
    setSaveError(getWorldIDErrorMessage(error.message || 'Bilinmeyen hata'));
  };

  // Save workflow function
  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      setSaveError('Workflow name is required');
      return;
    }

    // Check if WorldID bypass is enabled
    if (isWorldIDBypassEnabled('save-workflow')) {
      console.log('🚀 WorldID bypass enabled for workflow save');
      simulateWorldIDSuccess(handleWorkflowSaveSuccess, 500);
      return;
    }

    // Normal flow - show save modal for WorldID verification
    setShowSaveModal(true);
  };

  // Node event handlers
  const handleNodeEdit = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
      setShowNodeEditor(true);
    }
  }, [nodes]);

  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    setNodes(nds => nds.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleNodeCopy = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newNode = {
        ...node,
        id: `${node.id}_copy_${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          ...node.data,
          label: `${node.data.label} (Copy)`,
        },
      };
      setNodes(nds => [...nds, newNode]);
    }
  }, [nodes, setNodes]);

  const handleNodeExecute = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Update node status to running
      setNodes(nds => nds.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, status: 'running' } }
          : n
      ));

      // Simulate execution
      setTimeout(() => {
        setNodes(nds => nds.map(n => 
          n.id === nodeId 
            ? { ...n, data: { ...n.data, status: 'success', lastExecution: new Date() } }
            : n
        ));

        // Show success message
        alert(`"${node.data.label}" node'u başarıyla çalıştırıldı!`);
      }, 2000);
    }
  }, [nodes, setNodes]);

  // Connect callback
  const onConnect: OnConnect = useCallback(
    (params) => {
      const connection = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: designSystem.colors.primary[500], strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedNodes(prev => 
        prev.includes(node.id) 
          ? prev.filter(id => id !== node.id)
          : [...prev, node.id]
      );
    } else {
      setSelectedNodes([node.id]);
    }
  }, []);

  // Drag & Drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowInstance.getViewport();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type: type,
        position,
        data: {
          label: getNodeLabel(type),
          category: getNodeCategory(type),
          status: 'idle',
          description: getNodeDescription(type),
          icon: getNodeIcon(type),
          inputs: 1,
          outputs: 1,
          tags: [type],
          layer: 'default',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Helper functions for new nodes
  const getNodeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'trigger': 'Trigger',
      'agent': 'Agent',
      'condition': 'Condition',
      'connector': 'Connector',
      'http-request': 'HTTP Request',
      'database-query': 'Database Query',
      'email-send': 'Send Email',
      'notification': 'Notification',
      'loop': 'Loop',
      'delay': 'Delay',
      'transform': 'Transform',
      'error-handler': 'Error Handler',
      'custom-function': 'Custom Function',
    };
    return labels[type] || 'New Node';
  };

  const getNodeCategory = (type: string): WorkflowNode['data']['category'] => {
    const categories: Record<string, WorkflowNode['data']['category']> = {
      'trigger': 'trigger',
      'agent': 'agent',
      'condition': 'condition',
      'connector': 'connector',
      'http-request': 'http-request',
      'database-query': 'database-query',
      'email-send': 'email-send',
      'notification': 'notification',
      'loop': 'loop',
      'delay': 'delay',
      'transform': 'transform',
      'error-handler': 'error-handler',
      'custom-function': 'custom-function',
    };
    return categories[type] || 'utility';
  };

  const getNodeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'trigger': 'Starts the workflow',
      'agent': 'AI agent task',
      'condition': 'Conditional branching',
      'connector': 'External system connection',
      'http-request': 'Makes API calls',
      'database-query': 'Database operation',
      'email-send': 'Sends emails',
      'notification': 'Sends notifications',
      'loop': 'Loop operation',
      'delay': 'Wait time',
      'transform': 'Data transformation',
      'error-handler': 'Error management',
      'custom-function': 'Runs custom code',
    };
    return descriptions[type] || 'New node';
  };

  const getNodeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'trigger': '▶️',
      'agent': '🤖',
      'condition': '◊',
      'connector': '🔗',
      'http-request': '🌐',
      'database-query': '💾',
      'email-send': '📧',
      'notification': '🔔',
      'loop': '↻',
      'delay': '⏱️',
      'transform': '🔄',
      'error-handler': '⚠️',
      'custom-function': '🔧',
    };
    return icons[type] || '📦';
  };

  // Apply layout algorithm
  const applyLayout = useCallback((algorithm: string) => {
    if (algorithm === 'manual') return;
    
    const layoutFn = layoutAlgorithms[algorithm as keyof typeof layoutAlgorithms];
    if (layoutFn) {
      const layoutedNodes = layoutFn(nodes, edges);
      setNodes(layoutedNodes);
      setCurrentLayout(algorithm);
      
      // Fit view after layout
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.1 });
      }, 100);
    }
  }, [nodes, edges, setNodes, reactFlowInstance]);

  // Apply initial layout
  useEffect(() => {
    if (nodes.length > 0) {
      applyLayout('dagre');
    }
  }, [initialNodes.length]); // Only trigger on initial load

  // Close stats dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStats && !(event.target as Element).closest('.stats-dropdown')) {
        setShowStats(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCmd = event.metaKey || event.ctrlKey;
      
      switch (event.key.toLowerCase()) {
        case 's':
          if (isCmd) {
            event.preventDefault();
            onSave?.(nodes, edges);
          }
          break;
        case 'l':
          if (isCmd) {
            event.preventDefault();
            const loaded = onLoad?.();
            if (loaded) {
              setNodes(loaded.nodes);
              setEdges(loaded.edges);
            }
          }
          break;
        case 'g':
          event.preventDefault();
          setShowGrid(!showGrid);
          break;
        case 'f':
          if (isCmd) {
            event.preventDefault();
            reactFlowInstance.fitView();
          }
          break;
        case '1':
          if (isCmd) {
            event.preventDefault();
            applyLayout('dagre');
          }
          break;
        case '2':
          if (isCmd) {
            event.preventDefault();
            applyLayout('tree');
          }
          break;
        case '3':
          if (isCmd) {
            event.preventDefault();
            applyLayout('grid');
          }
          break;
        case '4':
          if (isCmd) {
            event.preventDefault();
            applyLayout('circular');
          }
          break;
        // Search removed - now handled in NodePalette
        case 'escape':
          setSelectedNodes([]);
          setShowShortcuts(false);
          setShowStats(false);
          setShowLayerDropdown(false);
          setShowSaveModal(false);
          setShowNodeEditor(false);
          break;
        case '?':
          if (event.shiftKey) {
            event.preventDefault();
            setShowShortcuts(!showShortcuts);
          }
          break;
        case 'delete':
        case 'backspace':
          if (selectedNodes.length > 0) {
            setNodes(nodes => nodes.filter(n => !selectedNodes.includes(n.id)));
            setEdges(edges => edges.filter(e => 
              !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
            ));
            setSelectedNodes([]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nodes, edges, selectedNodes, onSave, onLoad, showGrid, showShortcuts, reactFlowInstance, setNodes, setEdges, applyLayout]);

  // Zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out' | 'fit') => {
    switch (direction) {
      case 'in':
        reactFlowInstance.zoomIn();
        break;
      case 'out':
        reactFlowInstance.zoomOut();
        break;
      case 'fit':
        reactFlowInstance.fitView();
        break;
    }
  }, [reactFlowInstance]);

  // Save modal content
  const SaveModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Save Workflow</h3>
          <button
            onClick={() => setShowSaveModal(false)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Bypass Mode Active Indicator */}
        {isWorldIDBypassEnabled('save-workflow') && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🚀</span>
              <p className="text-yellow-800 text-sm font-medium">
                Bypass Mode Active - WorldID verification disabled
              </p>
            </div>
          </div>
        )}
        
        {!isWorkflowSaveVerified ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {isWorldIDBypassEnabled('save-workflow') 
                  ? 'Save Workflow (Bypass Mode)'
                  : 'Identity Verification Required'
                }
              </h4>
              <p className="text-gray-600 mb-6">
                {isWorldIDBypassEnabled('save-workflow')
                  ? 'WorldID verification is bypassed for development.'
                  : 'You need to verify your identity with WorldID to save workflows.'
                }
              </p>
            </div>
            
            {/* Error Display */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <p className="text-red-700 text-sm">{saveError}</p>
                </div>
              </div>
            )}
            
                         {isWorldIDBypassEnabled('save-workflow') ? (
               // Bypass Mode - Direct save button
               <button
                 onClick={() => handleWorkflowSaveSuccess({
                   proof: 'bypass-proof',
                   merkle_root: 'bypass-root',
                   nullifier_hash: 'bypass-nullifier',
                   verification_level: VerificationLevel.Device
                 })}
                 className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
               >
                 Save Workflow (Bypass)
               </button>
            ) : (
              // Normal WorldID flow
              <IDKitWidget
                app_id={WORLDID_APP_ID}
                action={WORLDID_ACTION_SAVE_WORKFLOW}
                verification_level={VerificationLevel.Device}
                handleVerify={handleWorkflowSaveSuccess}
                onSuccess={() => console.log('WorldID verification completed for workflow save')}
                onError={handleWorkflowSaveError}
              >
                {({ open }: { open: () => void }) => (
                  <button
                    onClick={open}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Verify with WorldID
                  </button>
                )}
              </IDKitWidget>
            )}

            {!isWorldIDBypassEnabled('save-workflow') && (
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Scan the QR code with the WorldID app
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <p className="text-sm text-green-600 mb-6">Identity verification successful!</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Nodes:</span>
                <span className="font-semibold text-gray-900">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Connections:</span>
                <span className="font-semibold text-gray-900">{edges.length}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setIsWorkflowSaveVerified(false);
                  setSaveError('');
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave?.(nodes, edges);
                  setShowSaveModal(false);
                  setIsWorkflowSaveVerified(false);
                  alert('Workflow saved successfully!');
                }}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Save Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    >
      {/* Header Toolbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                🔄
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Workflow Designer Pro</h1>
                <p className="text-sm text-gray-600">Professional workflow design environment</p>
              </div>
            </div>
          </div>

          {/* Center Section - Empty for clean look */}
          <div className="flex-1 max-w-md mx-8">
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Bypass Mode Indicator */}
            {isWorldIDBypassEnabled('save-workflow') && (
              <div className="flex items-center px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
                <span className="text-yellow-700 text-xs font-medium">
                  🚀 Bypass Mode
                </span>
              </div>
            )}
            
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Command className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={handleSaveWorkflow}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel - Node Palette & Controls */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-white/20 flex flex-col">
          {/* Node Palette - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <NodePalette />
          </div>
          
          {/* Bottom Panel - Controls */}
          <div className="border-t border-white/20 p-4 space-y-4 bg-white/40">
            {/* Layer Management */}
            <div>
              <div className="relative">
                <h3 
                  className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setShowLayerDropdown(!showLayerDropdown)}
                  title="Layer management"
                >
                  <Layers className="w-4 h-4" />
                  <span>Layers</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ({visibleLayers.size}/{layers.length})
                  </span>
                  <span className="text-xs text-gray-400">
                    {showLayerDropdown ? '▼' : '▶'}
                  </span>
                </h3>
                
                {showLayerDropdown && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 mb-3">
                    <div className="space-y-3">
                      {/* Select All/None */}
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs font-semibold text-gray-700">Layer Control</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setVisibleLayers(new Set(layers))}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            All
                          </button>
                          <button
                            onClick={() => setVisibleLayers(new Set())}
                            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            None
                          </button>
                        </div>
                      </div>
                      
                      {/* Layer List */}
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {layers.map(layer => (
                          <label key={layer} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={visibleLayers.has(layer)}
                              onChange={(e) => {
                                const newLayers = new Set(visibleLayers);
                                if (e.target.checked) {
                                  newLayers.add(layer);
                                } else {
                                  newLayers.delete(layer);
                                }
                                setVisibleLayers(newLayers);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 flex-1">{layer}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {nodes.filter(n => (n.data.layer || 'default') === layer).length}
                            </span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Apply Button */}
                      <button
                        onClick={() => setShowLayerDropdown(false)}
                        className="w-full text-xs bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Toggle */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <span>Info</span>
              </h3>
              <div className="relative stats-dropdown">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  title="Show/hide statistics"
                >
                  <Info className="w-4 h-4" />
                </button>
                
                {/* Statistics Dropdown */}
                {showStats && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-10">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Nodes:</span>
                        <span className="font-medium text-gray-900">{nodes.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Connections:</span>
                        <span className="font-medium text-gray-900">{edges.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Selected:</span>
                        <span className="font-medium text-blue-600">{selectedNodes.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Zoom:</span>
                        <span className="font-medium text-green-600">{Math.round(zoomLevel * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={filteredNodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                onEdit: handleNodeEdit,
                onDelete: handleNodeDelete,
                onCopy: handleNodeCopy,
                onExecute: handleNodeExecute,
              }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="top-right"
            className="bg-transparent"
            onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
          >
            <Background 
              color={designSystem.colors.secondary[300]}
              gap={20}
              variant={showGrid ? 'dots' as BackgroundVariant : undefined}
            />
            
            {/* Custom Controls */}
            <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 p-2 shadow-lg">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleZoom('in')}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleZoom('out')}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleZoom('fit')}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title="Fit View (⌘F)"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-md transition-colors ${
                      showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                    title="Toggle Grid (G)"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <MiniMap 
              nodeColor={(node) => {
                const category = (node as WorkflowNode).data.category;
                return designSystem.colors.categories[category]?.bg || designSystem.colors.secondary[400];
              }}
              className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg"
              maskColor="rgba(255, 255, 255, 0.2)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { key: '⌘S', desc: 'Save' },
                { key: '⌘L', desc: 'Load' },
                { key: '⌘F', desc: 'Fit View' },
                { key: 'G', desc: 'Toggle Grid' },
                { key: '⌘1', desc: 'Hierarchical Layout' },
                { key: '⌘2', desc: 'Tree Layout' },
                { key: '⌘3', desc: 'Grid Layout' },
                { key: '⌘4', desc: 'Circular Layout' },
                { key: 'Delete', desc: 'Delete Selected Nodes' },
                { key: '?', desc: 'Show This Help' },
                { key: 'Esc', desc: 'Clear Selection' },
              ].map(shortcut => (
                <div key={shortcut.key} className="flex justify-between">
                  <span className="text-gray-600">{shortcut.desc}</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Workflow Modal */}
      {showSaveModal && <SaveModal />}

      {/* Node Editor Modal */}
      {showNodeEditor && editingNode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Node: {editingNode.data.label}
                </h2>
                <button
                  onClick={() => setShowNodeEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Node Name
                      </label>
                      <input
                        type="text"
                        value={editingNode.data.label}
                        onChange={(e) => setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, label: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingNode.data.description || ''}
                        onChange={(e) => setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, description: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layer
                      </label>
                      <select
                        value={editingNode.data.layer || 'default'}
                        onChange={(e) => setEditingNode({
                          ...editingNode,
                          data: { ...editingNode.data, layer: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="default">Default</option>
                        <option value="triggers">Triggers</option>
                        <option value="agents">Agents</option>
                        <option value="logic">Logic</option>
                        <option value="connectors">Connectors</option>
                        <option value="utility">Utility</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Node-specific Configuration */}
                {editingNode.data.category === 'agent' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BitNet Prompt
                        </label>
                        <textarea
                          value={editingNode.data.config?.prompt || 'You are a helpful AI assistant. Your task:'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, prompt: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe how the agent should behave..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maksimum Token
                        </label>
                        <input
                          type="number"
                          value={editingNode.data.config?.maxTokens || 1000}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, maxTokens: parseInt(e.target.value) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sıcaklık (Temperature)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editingNode.data.config?.temperature || 0.7}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, temperature: parseFloat(e.target.value) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'http-request' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">HTTP Request Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={editingNode.data.config?.url || 'https://api.example.com/v1/resource'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://api.example.com/v1/resource"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          HTTP Method <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editingNode.data.config?.method || 'GET'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, method: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Headers (JSON)
                        </label>
                        <textarea
                          value={editingNode.data.config?.headers || '{"Content-Type": "application/json"}'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, headers: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body (JSON)
                        </label>
                        <textarea
                          value={editingNode.data.config?.body || '{"name": "{{name}}", "email": "{{email}}"}'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, body: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='{"name": "{{name}}", "email": "{{email}}"}'
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'database-query' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Query Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Connection ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingNode.data.config?.connectionId || 'mysql-main'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, connectionId: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="mysql-main"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SQL Query <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.query || 'SELECT * FROM orders WHERE status = ?'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, query: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="SELECT * FROM orders WHERE status = ?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parameters (JSON)
                        </label>
                        <textarea
                          value={editingNode.data.config?.parameters || '[{"name": "status", "value": "pending"}]'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, parameters: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='[{"name": "status", "value": "pending"}]'
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'email-send' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Sending Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipients <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.to || '["user@example.com"]'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, to: e.target.value }
                            }
                          })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='["user@example.com", "admin@example.com"]'
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingNode.data.config?.subject || 'Order Confirmation'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, subject: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Order Confirmation"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.body || 'Dear {{name}},\n\nYour order has been successfully received.\n\nThank you.'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, body: e.target.value }
                            }
                          })}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Dear {{name}},\n\nYour order has been successfully received.\n\nThank you."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments (JSON)
                        </label>
                        <textarea
                          value={editingNode.data.config?.attachments || '[]'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, attachments: e.target.value }
                            }
                          })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='[{"filename": "invoice.pdf", "path": "/files/invoice.pdf"}]'
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'condition' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Condition Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition Expression <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.expression || 'data.value > 100'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, expression: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="data.value > 100 && data.status === 'active'"
                        />
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p><strong>Example usage:</strong></p>
                        <p>• response.status === 200</p>
                        <p>• data.amount &gt; 1000</p>
                        <p>• user.role === 'admin'</p>
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'loop' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Loop Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Collection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.collection || '["user1", "user2", "user3"]'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, collection: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='["user1", "user2", "user3"]'
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loop Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editingNode.data.config?.loopType || 'forEach'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, loopType: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="forEach">For Each</option>
                          <option value="while">While</option>
                          <option value="parallel">Parallel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'delay' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delay Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (seconds) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={editingNode.data.config?.duration || 5}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, duration: parseInt(e.target.value) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="5"
                        />
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p><strong>Usage:</strong> Waits for 5 seconds between two API calls.</p>
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'transform' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transform Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Input Path <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingNode.data.config?.inputPath || 'data.user'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, inputPath: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="data.user"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mapping Script <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.mappingScript || 'return { fullName: user.firstName + " " + user.lastName }'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, mappingScript: e.target.value }
                            }
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="return { fullName: user.firstName + ' ' + user.lastName }"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'error-handler' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Management Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Node ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingNode.data.config?.targetNodeId || 'node_123'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, targetNodeId: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="node_123"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Retry Count
                        </label>
                        <input
                          type="number"
                          value={editingNode.data.config?.retryCount || 3}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, retryCount: parseInt(e.target.value) }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fallback Node ID
                        </label>
                        <input
                          type="text"
                          value={editingNode.data.config?.fallbackNodeId || ''}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, fallbackNodeId: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="node_fallback"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'custom-function' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Function Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          JavaScript Code <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.code || 'function execute(data) {\n  // Write your code here\n  return data;\n}'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, code: e.target.value }
                            }
                          })}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="function execute(data) {\n  // Write your code here\n  return data;\n}"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Input Schema (JSON Schema)
                        </label>
                        <textarea
                          value={editingNode.data.config?.inputSchema || '{"type": "object", "properties": {"value": {"type": "number"}}}'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, inputSchema: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder='{"type": "object", "properties": {"value": {"type": "number"}}}'
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingNode.data.category === 'notification' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Channel <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editingNode.data.config?.channel || 'Slack'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, channel: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Slack">Slack</option>
                          <option value="Teams">Microsoft Teams</option>
                          <option value="SMS">SMS</option>
                          <option value="Discord">Discord</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editingNode.data.config?.message || 'Workflow completed: {{workflowName}}'}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, message: e.target.value }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Workflow completed: {{workflowName}}"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={editingNode.data.config?.webhookUrl || ''}
                          onChange={(e) => setEditingNode({
                            ...editingNode,
                            data: { 
                              ...editingNode.data, 
                              config: { ...editingNode.data.config, webhookUrl: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowNodeEditor(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingNode) {
                        handleNodeUpdate(editingNode.id, editingNode.data);
                        setShowNodeEditor(false);
                        setEditingNode(null);
                      }
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowDesignerPro(props: WorkflowDesignerProProps) {
  return (
    <ReactFlowProvider>
      <WorkflowDesignerProComponent {...props} />
    </ReactFlowProvider>
  );
} 