import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Mail, Globe, MessageSquare } from 'lucide-react';

interface ConnectorNodeProps {
  data: {
    label: string;
    connectorType?: 'api' | 'database' | 'email' | 'slack';
    config: any;
  };
  selected?: boolean;
}

export function ConnectorNode({ data, selected }: ConnectorNodeProps) {
  const getIcon = () => {
    switch (data.connectorType) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4" />;
      case 'api':
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getGradient = () => {
    switch (data.connectorType) {
      case 'database':
        return 'from-teal-500 to-cyan-600';
      case 'email':
        return 'from-indigo-500 to-blue-600';
      case 'slack':
        return 'from-purple-500 to-indigo-600';
      case 'api':
      default:
        return 'from-slate-500 to-gray-600';
    }
  };

  const getTypeLabel = () => {
    switch (data.connectorType) {
      case 'database':
        return 'Veritabanı';
      case 'email':
        return 'E-posta';
      case 'slack':
        return 'Slack';
      case 'api':
      default:
        return 'API İsteği';
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
        <span className="text-xs text-gray-400">Bağlayıcı</span>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
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