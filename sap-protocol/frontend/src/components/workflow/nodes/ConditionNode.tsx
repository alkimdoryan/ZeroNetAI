import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    conditionType?: 'value' | 'text' | 'number' | 'exists';
    config: any;
  };
  selected?: boolean;
}

export function ConditionNode({ data, selected }: ConditionNodeProps) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm border-2 rounded-xl p-4 shadow-lg min-w-[200px] transition-all duration-200 ${
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md">
          <GitBranch className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
          <p className="text-xs text-gray-500 mt-1">Koşullu dallanma</p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Koşul</span>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
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
      <div className="absolute right-4 top-8 text-xs text-green-600 font-medium">✓</div>
      <div className="absolute right-4 top-12 text-xs text-red-600 font-medium">✗</div>
    </div>
  );
} 