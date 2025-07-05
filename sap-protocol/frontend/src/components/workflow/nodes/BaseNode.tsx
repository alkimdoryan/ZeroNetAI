import React, { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { designSystem, getNodeCategoryStyle, getStatusColor as getDesignStatusColor, createTransition } from '../../../styles/design-system';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Edit3
} from 'lucide-react';

export interface BaseNodeProps {
  id: string;
  data: {
    label: string;
    category: keyof typeof designSystem.colors.categories;
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
    // Handler functions
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
    onExecute?: (id: string) => void;
  };
  selected?: boolean;
  dragging?: boolean;
}

export function BaseNode({ 
  id, 
  data, 
  selected = false, 
  dragging = false
}: BaseNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const categoryStyle = getNodeCategoryStyle(data.category);

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getNodeStatusColor = () => {
    switch (data.status) {
      case 'running':
        return designSystem.colors.primary[500];
      case 'success':
        return designSystem.colors.success[500];
      case 'error':
        return designSystem.colors.error[500];
      case 'warning':
        return designSystem.colors.warning[500];
      default:
        return designSystem.colors.secondary[400];
    }
  };

  const nodeStyle = {
    minWidth: designSystem.nodes.size.normal.width,
    minHeight: designSystem.nodes.size.normal.height,
    padding: designSystem.nodes.size.normal.padding,
    borderRadius: designSystem.borderRadius['2xl'],
    border: `2px solid ${selected ? designSystem.colors.primary[500] : categoryStyle.border}`,
    background: `linear-gradient(135deg, ${categoryStyle.bg}15 0%, ${categoryStyle.bg}05 100%)`,
    backdropFilter: 'blur(10px)',
    boxShadow: selected 
      ? designSystem.shadows.glow.primary 
      : isHovered 
        ? designSystem.shadows.lg 
        : designSystem.shadows.md,
    transform: selected 
      ? 'scale(1.05)' 
      : isHovered 
        ? 'scale(1.02)' 
        : 'scale(1)',
    transition: createTransition(['transform', 'box-shadow', 'border-color'], 'normal', 'spring'),
    opacity: dragging ? 0.8 : 1,
  };

  const handleMenuAction = useCallback((action: string) => {
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
  }, [id, data]);

  return (
    <div
      style={nodeStyle}
      className="relative bg-white/90 backdrop-blur-sm group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Category Icon */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: categoryStyle.bg }}
          >
            {data.icon || <div className="w-5 h-5 bg-white/20 rounded" />}
          </div>
          
          {/* Node Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {data.label}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {data.description || data.category}
            </p>
          </div>
        </div>

        {/* Status & Menu */}
        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          {data.status && (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
                             style={{ backgroundColor: getNodeStatusColor() + '20', color: getNodeStatusColor() }}
            >
              {getStatusIcon()}
            </div>
          )}

          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className="space-y-2">
        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{data.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Execution Info */}
        {data.lastExecution && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last execution</span>
            <span>{data.lastExecution.toLocaleTimeString()}</span>
          </div>
        )}

        {data.executionTime && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Duration</span>
            <span>{data.executionTime}ms</span>
          </div>
        )}
      </div>

      {/* Progress Bar for Running Status */}
      {data.status === 'running' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl animate-pulse"
            style={{ width: '60%' }}
          />
        </div>
      )}

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute top-12 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-max max-w-xs z-[70] transform origin-top-right">
          <div className="px-1">
            <button
              onClick={() => handleMenuAction('execute')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Run</span>
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

      {/* Connection Handles */}
      {data.inputs && data.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-white"
          style={{ backgroundColor: categoryStyle.bg }}
        />
      )}
      
      {data.outputs && data.outputs > 0 && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-white"
          style={{ backgroundColor: categoryStyle.bg }}
        />
      )}

      {/* Multiple outputs for condition nodes */}
      {data.category === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '40%', backgroundColor: designSystem.colors.success[500] }}
            className="w-3 h-3 border-2 border-white"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '60%', backgroundColor: designSystem.colors.error[500] }}
            className="w-3 h-3 border-2 border-white"
          />
        </>
      )}

      {/* Keyboard Shortcuts Overlay */}
      {selected && (
        <div className="absolute -top-8 left-0 right-0 text-center">
          <div className="inline-block bg-gray-900 text-white text-xs px-2 py-1 rounded">
            E: Edit | D: Delete | C: Copy
          </div>
        </div>
      )}
    </div>
  );
} 