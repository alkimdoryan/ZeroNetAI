import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, MoreVertical, Play, Edit3, Copy, Trash2 } from 'lucide-react';

interface ConditionNodeProps {
  id: string;
  data: {
    label: string;
    conditionType?: 'value' | 'text' | 'number' | 'exists';
    config: any;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
    onExecute?: (id: string) => void;
  };
  selected?: boolean;
}

export function ConditionNode({ id, data, selected }: ConditionNodeProps) {
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

  return (
    <div
      className={`relative bg-white/90 backdrop-blur-sm border-2 rounded-xl p-4 shadow-lg min-w-[200px] transition-all duration-200 group ${
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
            <p className="text-xs text-gray-500 mt-1">Conditional branching</p>
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
        <span className="text-xs text-gray-400">Condition</span>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
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
              <span className="whitespace-nowrap">Execute</span>
            </button>
            <button
              onClick={() => handleMenuAction('edit')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Edit</span>
            </button>
            <button
              onClick={() => handleMenuAction('copy')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Copy</span>
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => handleMenuAction('delete')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Delete</span>
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
        id="true"
        style={{ top: 40 }}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: 60 }}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
      
      {/* Branch labels */}
      <div className="absolute right-10 top-8 text-xs text-green-600 font-medium">✓</div>
      <div className="absolute right-10 top-12 text-xs text-red-600 font-medium">✗</div>
    </div>
  );
} 