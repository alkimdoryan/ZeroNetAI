import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Brain, MessageSquare, MoreVertical, Play, Edit3, Copy, Trash2 } from 'lucide-react';

interface AgentNodeProps {
  id: string;
  data: {
    label: string;
    agentType?: 'general' | 'sentiment' | 'classification' | 'translation';
    config: any;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
    onExecute?: (id: string) => void;
    status?: 'success' | 'error' | 'running';
    executionTime?: number;
    description?: string;
    lastExecution?: Date;
  };
  selected?: boolean;
}

export function AgentNode({ id, data, selected }: AgentNodeProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'edit':
        data.onEdit?.(id);
        break;
      case 'copy':
        data.onCopy?.(id);
        break;
      case 'delete':
        data.onDelete?.(id);
        break;
      case 'execute':
        data.onExecute?.(id);
        break;
    }
  };

  const getIcon = () => {
    switch (data.agentType) {
      case 'sentiment':
        return <MessageSquare className="w-4 h-4" />;
      case 'classification':
        return <Brain className="w-4 h-4" />;
      case 'translation':
        return <Bot className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getGradient = () => {
    switch (data.agentType) {
      case 'sentiment':
        return 'from-pink-500 to-rose-600';
      case 'classification':
        return 'from-indigo-500 to-purple-600';
      case 'translation':
        return 'from-teal-500 to-cyan-600';
      default:
        return 'from-orange-500 to-red-600';
    }
  };

  const getTypeLabel = () => {
    switch (data.agentType) {
      case 'sentiment':
        return 'Duygu Analizi';
      case 'classification':
        return 'Sınıflandırma';
      case 'translation':
        return 'Çeviri';
      default:
        return 'Genel Görev';
    }
  };

  return (
    <div
      className={`relative bg-white/90 backdrop-blur-sm border-2 rounded-xl p-4 shadow-lg min-w-[200px] transition-all duration-200 group ${
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white shadow-md`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{getTypeLabel()}</p>
          </div>
        </div>

        {/* Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Quick actions */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <button 
          onClick={() => console.log('Execute agent node')}
          className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xs transition-all"
          title="Execute"
        >
          ▶
        </button>
        <button 
          onClick={() => console.log('Edit agent node')}
          className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs transition-all"
          title="Edit"
        >
          ✏
        </button>
        <button 
          onClick={() => console.log('Copy agent node')}
          className="w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs transition-all"
          title="Copy"
        >
          📋
        </button>
        <button 
          onClick={() => console.log('Delete agent node')}
          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-all"
          title="Delete"
        >
          🗑
        </button>
      </div>

      {/* Status indicator */}
      {data.status && (
        <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${
          data.status === 'success' ? 'bg-green-500' : 
          data.status === 'error' ? 'bg-red-500' : 
          data.status === 'running' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
        }`} />
      )}

      {/* Agent info section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-md">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{data.label}</h3>
              <p className="text-xs text-gray-500">{data.description || 'BitNet LLM Agent'}</p>
            </div>
          </div>
          
          {data.lastExecution && (
            <div className="text-right">
              <div className="text-xs text-gray-400">Last run</div>
              <div className="text-xs font-medium text-gray-600">
                {data.executionTime ? `${data.executionTime}ms` : 'N/A'}
              </div>
            </div>
          )}
        </div>

        {/* Agent configuration preview */}
        <div className="bg-orange-50/70 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-orange-800">Model:</span>
            <span className="text-xs text-orange-700">{data.config?.model || 'BitNet-LLM-1.5B'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-orange-800">Temperature:</span>
            <span className="text-xs text-orange-700">{data.config?.temperature || '0.7'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-orange-800">Max Tokens:</span>
            <span className="text-xs text-orange-700">{data.config?.maxTokens || '1000'}</span>
          </div>
        </div>
      </div>

      {/* Node controls */}
      <div className="flex justify-between items-center pt-2 border-t border-orange-200/50">
        <div className="flex space-x-1">
          <button 
            onClick={() => console.log('Run agent')}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-all flex items-center space-x-1"
          >
            <span>▶</span>
            <span className="whitespace-nowrap">Run</span>
          </button>
          <button 
            onClick={() => console.log('Edit agent')}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-all flex items-center space-x-1"
          >
            <span>✏</span>
            <span className="whitespace-nowrap">Edit</span>
          </button>
        </div>
        
        <div className="flex space-x-1">
          <button 
            onClick={() => console.log('Copy agent')}
            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-md transition-all flex items-center space-x-1"
          >
            <span>📋</span>
            <span className="whitespace-nowrap">Copy</span>
          </button>
          <button 
            onClick={() => console.log('Delete agent')}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-all flex items-center space-x-1"
          >
            <span>🗑</span>
            <span className="whitespace-nowrap">Delete</span>
          </button>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
} 