import React, { useState } from 'react';
import { 
  Play, 
  Timer, 
  Zap, 
  Bot, 
  GitBranch, 
  Database, 
  Mail, 
  Globe, 
  MessageSquare, 
  Settings,
  // Yeni node iconları
  RefreshCw,
  Clock,
  Shuffle,
  AlertTriangle,
  Code,
  Bell,
  Search,
  Filter,
  Plus,
  Layers,
  X,
  Move
} from 'lucide-react';
import { IDKitWidget, type ISuccessResult, type IErrorState, VerificationLevel } from '@worldcoin/idkit';
import { 
  WORLDID_APP_ID, 
  WORLDID_ACTION_CREATE_NODE,
  getWorldIDErrorMessage,
  isWorldIDBypassEnabled,
  simulateWorldIDSuccess
} from '../../config/contracts';

interface NodeType {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  gradient: string;
  isNew?: boolean;
  isCustom?: boolean;
}

const nodeTypes: NodeType[] = [
  // Triggers
  {
    id: 'trigger-manual',
    type: 'trigger',
    label: 'Manual Trigger',
    description: 'Manually starts the workflow',
    icon: <Play className="w-4 h-4" />,
    category: 'triggers',
    gradient: 'from-green-400 to-green-600',
    isNew: true
  },
  {
    id: 'trigger-timer',
    type: 'trigger',
    label: 'Timer Trigger',
    description: 'Runs the workflow at specific intervals',
    icon: <Clock className="w-4 h-4" />,
    category: 'triggers',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'trigger-webhook',
    type: 'trigger',
    label: 'Webhook Trigger',
    description: 'Triggers the workflow with HTTP requests',
    icon: <Zap className="w-4 h-4" />,
    category: 'triggers',
    gradient: 'from-purple-400 to-purple-600'
  },

  // Agents
  {
    id: 'agent-task',
    type: 'agent',
    label: 'Agent Task',
    description: 'Processes tasks with BitNet LLM agent',
    icon: <Bot className="w-4 h-4" />,
    category: 'agents',
    gradient: 'from-orange-400 to-red-600',
    isNew: true
  },
  {
    id: 'sentiment-agent',
    type: 'agent',
    label: 'Sentiment Analysis',
    description: 'Performs sentiment analysis on text',
    icon: <Bot className="w-5 h-5" />,
    category: 'agents',
    gradient: 'from-pink-500 to-rose-600'
  },

  // Logic - Updated category name
  {
    id: 'condition-if',
    type: 'condition',
    label: 'Condition (If/Else)',
    description: 'Conditional branching in workflow',
    icon: <GitBranch className="w-4 h-4" />,
    category: 'logic',
    gradient: 'from-yellow-400 to-orange-600'
  },
  {
    id: 'loop-foreach',
    type: 'loop',
    label: 'Loop (For Each)',
    description: 'Iterates over collections of data',
    icon: <RefreshCw className="w-4 h-4" />,
    category: 'logic',
    gradient: 'from-purple-400 to-indigo-600'
  },

  // Connectors
  {
    id: 'http-request',
    type: 'http-request',
    label: 'HTTP Request',
    description: 'Makes HTTP API calls',
    icon: <Globe className="w-4 h-4" />,
    category: 'connectors',
    gradient: 'from-blue-400 to-indigo-600'
  },
  {
    id: 'database-query',
    type: 'database-query',
    label: 'Database Query',
    description: 'Executes SQL queries on databases',
    icon: <Database className="w-4 h-4" />,
    category: 'connectors',
    gradient: 'from-green-400 to-teal-600'
  },
  {
    id: 'email-send',
    type: 'email-send',
    label: 'Send Email',
    description: 'Sends emails via SMTP',
    icon: <Mail className="w-4 h-4" />,
    category: 'connectors',
    gradient: 'from-red-400 to-pink-600'
  },
  {
    id: 'notification',
    type: 'notification',
    label: 'Notification',
    description: 'Sends notifications via Slack, Discord, SMS',
    icon: <Bell className="w-4 h-4" />,
    category: 'connectors',
    gradient: 'from-green-400 to-blue-600',
    isNew: true
  },

  // Utility - New category
  {
    id: 'delay-timer',
    type: 'delay',
    label: 'Delay',
    description: 'Pauses workflow execution for a specified time',
    icon: <Clock className="w-4 h-4" />,
    category: 'utility',
    gradient: 'from-gray-400 to-gray-600'
  },
  {
    id: 'transform-data',
    type: 'transform',
    label: 'Transform Data',
    description: 'Transforms and maps data using JavaScript',
    icon: <Shuffle className="w-4 h-4" />,
    category: 'utility',
    gradient: 'from-cyan-400 to-blue-600'
  },
  {
    id: 'error-handler',
    type: 'error-handler',
    label: 'Error Handler',
    description: 'Manages error conditions and provides alternative flow',
    icon: <AlertTriangle className="w-4 h-4" />,
    category: 'utility',
    gradient: 'from-red-400 to-red-600'
  },
  {
    id: 'custom-function',
    type: 'custom-function',
    label: 'Custom Function',
    description: 'Executes user-defined JavaScript code',
    icon: <Code className="w-4 h-4" />,
    category: 'utility',
    gradient: 'from-indigo-400 to-purple-600'
  }
];

const categories = [
  { id: 'triggers', label: 'Triggers', icon: <Play className="w-4 h-4" />, description: 'Nodes that start workflows' },
  { id: 'agents', label: 'Agents', icon: <Bot className="w-4 h-4" />, description: 'AI/ML tasks' },
  { id: 'connectors', label: 'Connectors', icon: <Globe className="w-4 h-4" />, description: 'External integrations' },
  { id: 'logic', label: 'Logic', icon: <GitBranch className="w-4 h-4" />, description: 'Flow control' },
  { id: 'utility', label: 'Utility', icon: <Settings className="w-4 h-4" />, description: 'Helper functions' },
  { id: 'custom', label: 'Custom', icon: <Plus className="w-4 h-4" />, description: 'User-defined' }
];

export function NodePalette() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isWorldIDVerified, setIsWorldIDVerified] = useState(false);
  const [error, setError] = useState<string>('');
  const [newNodeData, setNewNodeData] = useState({
    name: '',
    description: '',
    category: 'custom',
    parameters: []
  });

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTypes.filter(node => {
    const matchesCategory = activeCategory === 'all' || node.category === activeCategory;
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWorldIDSuccess = (result: ISuccessResult) => {
    console.log('WorldID verification successful:', result);
    setError('');
    setIsWorldIDVerified(true);
  };

  const handleWorldIDError = (error: IErrorState) => {
    console.error('WorldID verification error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // More detailed error handling
    let errorMessage = 'Unknown error';
    if (error.message) {
      errorMessage = getWorldIDErrorMessage(error.message);
    } else if (error.code) {
      errorMessage = getWorldIDErrorMessage(error.code);
    }
    
    setError(errorMessage);
  };

  const handleCreateNodeClick = () => {
    // Check if WorldID bypass is enabled
    if (isWorldIDBypassEnabled('create-custom-node')) {
      console.log('🚀 WorldID bypass enabled for custom node creation');
      simulateWorldIDSuccess(handleWorldIDSuccess, 500);
      return;
    }

    // Normal flow - show create modal
    setShowCreateModal(true);
  };

  const handleCreateNode = () => {
    // Logic for creating custom node
    console.log('Creating custom node:', newNodeData);
    
    // Reset form and close modal
    setNewNodeData({
      name: '',
      description: '',
      category: 'custom',
      parameters: []
    });
    setShowCreateModal(false);
    setIsWorldIDVerified(false);
    setError('');
    
    alert(`Custom node "${newNodeData.name}" created successfully!`);
  };

  return (
    <div className="bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Node Library</h2>
          
          {/* Bypass Mode Indicator */}
          {isWorldIDBypassEnabled('create-custom-node') && (
            <div className="flex items-center px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
              <span className="text-yellow-700 text-xs font-medium">
                🚀 Bypass
              </span>
            </div>
          )}
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredNodes.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-move"
            >
              <div className="flex items-start space-x-3">
                                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gradient-to-r ${node.gradient}`}>
                   {node.icon}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-medium text-gray-900 text-sm truncate">
                     {node.label}
                   </h3>
                   <p className="text-xs text-gray-500 line-clamp-2">
                     {node.description}
                   </p>
                   <div className="flex flex-wrap gap-1 mt-2">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                       {node.category}
                     </span>
                     {node.isNew && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                         New
                       </span>
                     )}
                   </div>
                 </div>
              </div>
              
              {/* Drag Indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Move className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Custom Node Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleCreateNodeClick}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Node</span>
        </button>
      </div>

      {/* Create Node Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create Custom Node</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Bypass Mode Indicator */}
            {isWorldIDBypassEnabled('create-custom-node') && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">🚀</span>
                  <p className="text-yellow-800 text-sm font-medium">
                    Bypass Mode Active - WorldID verification disabled
                  </p>
                </div>
              </div>
            )}
            
            {!isWorldIDVerified ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {isWorldIDBypassEnabled('create-custom-node')
                      ? 'Create Custom Node (Bypass Mode)'
                      : 'Identity Verification Required'
                    }
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {isWorldIDBypassEnabled('create-custom-node')
                      ? 'WorldID verification is bypassed for development.'
                      : 'You need to verify your identity with WorldID to create custom nodes.'
                    }
                  </p>
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500">⚠️</span>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}
                
                {isWorldIDBypassEnabled('create-custom-node') ? (
                  // Bypass Mode - Direct verify button
                  <button
                    onClick={() => handleWorldIDSuccess({
                      proof: 'bypass-proof',
                      merkle_root: 'bypass-root',
                      nullifier_hash: 'bypass-nullifier',
                      verification_level: VerificationLevel.Device
                    })}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Verify Identity (Bypass)
                  </button>
                ) : (
                  // Normal WorldID flow
                  <IDKitWidget
                    app_id={WORLDID_APP_ID}
                    action={WORLDID_ACTION_CREATE_NODE}
                    signal="create-node"
                    verification_level={VerificationLevel.Device}
                    handleVerify={handleWorldIDSuccess}
                    onSuccess={() => console.log('WorldID verification completed')}
                    onError={handleWorldIDError}
                  >
                    {({ open }: { open: () => void }) => (
                      <button
                        onClick={open}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                      >
                        Verify with WorldID
                      </button>
                    )}
                  </IDKitWidget>
                )}

                {!isWorldIDBypassEnabled('create-custom-node') && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Scan the QR code with the WorldID app
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Node creation form after verification
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                  <p className="text-sm text-green-600 mb-6">Identity verification successful!</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Node Name
                    </label>
                    <input
                      type="text"
                      value={newNodeData.name}
                      onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter node name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newNodeData.description}
                      onChange={(e) => setNewNodeData({...newNodeData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Describe what this node does"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsWorldIDVerified(false);
                      setError('');
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNode}
                    disabled={!newNodeData.name.trim() || !newNodeData.description.trim()}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Node
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Node Card Component
function NodeCard({ node, onDragStart }: { node: NodeType; onDragStart: (event: React.DragEvent, nodeType: string) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 cursor-move hover:shadow-lg transition-all duration-200 hover:scale-105"
    >
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.gradient} flex items-center justify-center text-white shadow-md`}>
          {node.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {node.label}
            </h3>
            {node.isNew && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
            {node.isCustom && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                CUSTOM
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>
      
      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
    </div>
  );
} 