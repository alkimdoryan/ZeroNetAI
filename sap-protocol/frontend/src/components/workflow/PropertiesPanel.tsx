import { useState } from 'react';
import { X, Save, Settings, Bot, Play, GitBranch, Zap } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
}

export function PropertiesPanel({ selectedNode, onClose, onUpdateNode }: PropertiesPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>(selectedNode?.data || {});

  if (!selectedNode) return null;

  const handleSave = () => {
    onUpdateNode(selectedNode.id, formData);
    onClose();
  };

  const renderNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return <Play className="w-5 h-5" />;
      case 'agent':
        return <Bot className="w-5 h-5" />;
      case 'condition':
        return <GitBranch className="w-5 h-5" />;
      case 'connector':
        return <Zap className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const renderTriggerSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Type
        </label>
        <select
          value={String(formData.triggerType || 'manual')}
          onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="manual">Manual</option>
          <option value="timer">Timer</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>

      {formData.triggerType === 'timer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interval (minutes)
          </label>
          <input
            type="number"
            value={Number(formData.interval || 5)}
            onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>
      )}

      {formData.triggerType === 'webhook' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webhook URL
          </label>
          <input
            type="text"
            value={String(formData.webhookUrl || '')}
            onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://api.example.com/webhook"
          />
        </div>
      )}
    </div>
  );

  const renderAgentSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agent Type
        </label>
        <select
          value={String(formData.agentType || 'general')}
          onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="general">General Task</option>
          <option value="sentiment">Sentiment Analysis</option>
          <option value="classification">Classification</option>
          <option value="translation">Translation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Message
        </label>
        <textarea
          value={String(formData.systemMessage || '')}
          onChange={(e) => setFormData({ ...formData, systemMessage: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
          placeholder="System message to define agent behavior..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confidence Threshold
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={Number(formData.confidenceThreshold || 0.7)}
          onChange={(e) => setFormData({ ...formData, confidenceThreshold: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">
          {(Number(formData.confidenceThreshold || 0.7) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );

  const renderConditionSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition Type
        </label>
        <select
          value={String(formData.conditionType || 'value')}
          onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="value">Value Comparison</option>
          <option value="text">Text Content</option>
          <option value="number">Numerical Comparison</option>
          <option value="exists">Existence Check</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition
        </label>
        <input
          type="text"
          value={String(formData.condition || '')}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="For example: confidence > 0.8"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          True Branch Label
        </label>
        <input
          type="text"
          value={String(formData.trueLabel || 'True')}
          onChange={(e) => setFormData({ ...formData, trueLabel: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          False Branch Label
        </label>
        <input
          type="text"
          value={String(formData.falseLabel || 'False')}
          onChange={(e) => setFormData({ ...formData, falseLabel: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderConnectorSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Connector Type
        </label>
        <select
          value={String(formData.connectorType || 'api')}
          onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="api">API</option>
          <option value="database">Database</option>
          <option value="webhook">Webhook</option>
          <option value="email">Email</option>
        </select>
      </div>

      {formData.connectorType === 'api' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API URL
            </label>
            <input
              type="text"
              value={String(formData.apiUrl || '')}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://api.example.com/endpoint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Method
            </label>
            <select
              value={String(formData.method || 'GET')}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headers (JSON)
            </label>
            <textarea
              value={String(formData.headers || '{}')}
              onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
              placeholder='{"Content-Type": "application/json"}'
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderNodeSettings = () => {
    const nodeType = selectedNode.type || 'default';
    
    return (
      <div className="space-y-6">
        {/* Node-specific settings */}
        {nodeType === 'trigger' && renderTriggerSettings()}
        {nodeType === 'agent' && renderAgentSettings()}
        {nodeType === 'condition' && renderConditionSettings()}
        {nodeType === 'connector' && renderConnectorSettings()}
        
        {/* Common settings */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Common Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node Label
              </label>
              <input
                type="text"
                value={String(formData.label || '')}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter node label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={String(formData.description || '')}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                placeholder="Enter node description"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="retryOnError"
                checked={Boolean(formData.retryOnError)}
                onChange={(e) => setFormData({ ...formData, retryOnError: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="retryOnError" className="text-sm text-gray-700">
                Enable retry on error
              </label>
            </div>

            {formData.retryOnError && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Count
                </label>
                <input
                  type="number"
                  value={Number(formData.retryCount || 3)}
                  onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={Number(formData.timeout || 30)}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="300"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {renderNodeIcon(selectedNode.type || 'default')}
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedNode.type?.charAt(0).toUpperCase()}{selectedNode.type?.slice(1)} Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {renderNodeSettings()}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 