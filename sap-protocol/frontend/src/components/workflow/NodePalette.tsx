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
  X
} from 'lucide-react';
import { IDKitWidget, type ISuccessResult, type IErrorState, VerificationLevel } from '@worldcoin/idkit';
import { 
  WORLDID_APP_ID, 
  WORLDID_ACTION_CREATE_NODE,
  getWorldIDErrorMessage 
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

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Node Library</h2>
        <p className="text-sm text-gray-600">Drag and drop to canvas</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for nodes to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Info */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">"{searchQuery}"</span> found {filteredNodes.length} nodes.
            {filteredNodes.length > 0 ? ' Drag and drop to add to your workflow.' : ' Try different keywords.'}
          </p>
        </div>
      )}

      {/* Node List */}
      <div className="space-y-4">
        {activeCategory === 'all' ? (
          // Grouped display for all categories
          categories.map((category) => {
            const categoryNodes = filteredNodes.filter(node => node.category === category.id);
            if (categoryNodes.length === 0) return null;
            
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                  {category.icon}
                  <span>{category.label}</span>
                  <span className="text-xs text-gray-500">({categoryNodes.length})</span>
                </div>
                
                <div className="space-y-2">
                  {categoryNodes.map((node) => (
                    <NodeCard key={node.id} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Flat list for single category
          <div className="space-y-2">
            {filteredNodes.map((node) => (
              <NodeCard key={node.id} node={node} onDragStart={onDragStart} />
            ))}
          </div>
        )}
      </div>

      {/* Create Custom Node */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-purple-900">Create Custom Node</h3>
              <p className="text-sm text-purple-600">Design your own node</p>
            </div>
          </div>
        </button>
      </div>

      {/* Ready Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <Layers className="w-4 h-4" />
          <span>Ready Templates</span>
        </h3>
        <div className="space-y-2">
          {[
            { name: 'API → Database', desc: 'HTTP → Transform → Database', nodes: 3 },
            { name: 'Sentiment Analysis', desc: 'Webhook → Agent → Notification', nodes: 3 },
            { name: 'Data Pipeline', desc: 'Timer → Loop → Transform → Email', nodes: 4 },
            { name: 'Error Management', desc: 'HTTP → Error Handler → Retry', nodes: 3 }
          ].map((template, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-blue-900">{template.name}</div>
                  <div className="text-xs text-blue-600 mt-1">{template.desc}</div>
                </div>
                <div className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
                  {template.nodes} nodes
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Node Creation Modal */}
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
            
            {!isWorldIDVerified ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Identity Verification Required
                  </h4>
                  <p className="text-gray-600 mb-6">
                    You need to verify your identity with WorldID to create custom nodes.
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
                
                <IDKitWidget
                  app_id={WORLDID_APP_ID}
                  action={WORLDID_ACTION_CREATE_NODE}
                  signal="create-node"
                  verification_level={VerificationLevel.Device}
                  handleVerify={handleWorldIDSuccess}
                  onSuccess={() => console.log('WorldID verification completed')}
                  onError={handleWorldIDError}
                >
                  {({ open }) => (
                    <button
                      onClick={open}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      Verify with WorldID
                    </button>
                  )}
                </IDKitWidget>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Scan the QR code with the WorldID app
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">Identity verification successful!</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Node Name
                  </label>
                  <input
                    type="text"
                    value={newNodeData.name}
                    onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Web Scraper Node"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newNodeData.description}
                    onChange={(e) => setNewNodeData({...newNodeData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe what the node does..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newNodeData.category}
                    onChange={(e) => setNewNodeData({...newNodeData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="custom">Custom</option>
                    <option value="connectors">Connectors</option>
                    <option value="logic">Logic</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsWorldIDVerified(false);
                      setError('');
                      setNewNodeData({name: '', description: '', category: 'custom', parameters: []});
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newNodeData.name.trim() && newNodeData.description.trim()) {
                        console.log('Creating custom node:', newNodeData);
                        // Here you would save the custom node
                        setShowCreateModal(false);
                        setIsWorldIDVerified(false);
                        setError('');
                        setNewNodeData({name: '', description: '', category: 'custom', parameters: []});
                        alert('Custom node created successfully!');
                      } else {
                        alert('Please fill in all fields.');
                      }
                    }}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl hover:shadow-lg transition-all duration-200"
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