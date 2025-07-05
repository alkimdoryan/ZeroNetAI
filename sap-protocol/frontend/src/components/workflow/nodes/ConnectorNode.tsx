import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Mail, Globe, MessageSquare, MoreVertical, Play, Edit3, Copy, Trash2 } from 'lucide-react';

interface ConnectorNodeProps {
  id: string;
  data: {
    label: string;
    connectorType?: 'api' | 'database' | 'email' | 'slack';
    config: any;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
    onExecute?: (id: string) => void;
  };
  selected?: boolean;
}

export function ConnectorNode({ id, data, selected }: ConnectorNodeProps) {
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

      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Bağlayıcı</span>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute top-12 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-max max-w-xs z-[70] transform origin-top-right">
          <div className="px-1">
            <button
              onClick={() => handleMenuAction('execute')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Çalıştır</span>
            </button>
            <button
              onClick={() => handleMenuAction('edit')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Düzenle</span>
            </button>
            <button
              onClick={() => handleMenuAction('copy')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Kopyala</span>
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => handleMenuAction('delete')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Sil</span>
            </button>
          </div>
        </div>
      )}

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