import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Brain, MessageSquare } from 'lucide-react';

interface AgentNodeProps {
  data: {
    label: string;
    agentType?: 'general' | 'sentiment' | 'classification' | 'translation';
    config: any;
  };
  selected?: boolean;
}

export function AgentNode({ data, selected }: AgentNodeProps) {
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
      className={`bg-white/90 backdrop-blur-sm border-2 rounded-xl p-4 shadow-lg min-w-[200px] transition-all duration-200 ${
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white shadow-md`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
          <p className="text-xs text-gray-500 mt-1">{getTypeLabel()}</p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Agent</span>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
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