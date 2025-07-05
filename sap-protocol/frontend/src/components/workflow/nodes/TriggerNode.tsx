import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, Timer, Zap } from 'lucide-react';

interface TriggerNodeData {
  label: string;
  triggerType: 'manual' | 'timer' | 'webhook';
  config: any;
}

export function TriggerNode({ data, selected }: NodeProps<TriggerNodeData>) {
  const getIcon = () => {
    switch (data.triggerType) {
      case 'manual':
        return <Play className="w-4 h-4" />;
      case 'timer':
        return <Timer className="w-4 h-4" />;
      case 'webhook':
        return <Zap className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getGradient = () => {
    switch (data.triggerType) {
      case 'manual':
        return 'from-green-500 to-emerald-600';
      case 'timer':
        return 'from-blue-500 to-blue-600';
      case 'webhook':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-green-500 to-emerald-600';
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
          <p className="text-xs text-gray-500 mt-1">
            {data.triggerType === 'manual' && 'Manuel başlatma'}
            {data.triggerType === 'timer' && `Her ${data.config?.interval || 5} dakika`}
            {data.triggerType === 'webhook' && 'HTTP webhook'}
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Tetikleyici</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
} 