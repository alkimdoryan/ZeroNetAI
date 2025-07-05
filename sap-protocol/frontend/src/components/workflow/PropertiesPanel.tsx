import React, { useState } from 'react';
import { X, Save, Settings, Bot, Play, GitBranch, Zap } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
}

export function PropertiesPanel({ selectedNode, onClose, onUpdateNode }: PropertiesPanelProps) {
  const [formData, setFormData] = useState(selectedNode?.data || {});

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
          Tetikleyici Türü
        </label>
        <select
          value={formData.triggerType || 'manual'}
          onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="manual">Manuel</option>
          <option value="timer">Zamanlayıcı</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>

      {formData.triggerType === 'timer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Çalışma Aralığı (dakika)
          </label>
          <input
            type="number"
            value={formData.interval || 5}
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
            value={formData.webhookUrl || ''}
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
          Agent Türü
        </label>
        <select
          value={formData.agentType || 'general'}
          onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="general">Genel Görev</option>
          <option value="sentiment">Duygu Analizi</option>
          <option value="classification">Sınıflandırma</option>
          <option value="translation">Çeviri</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sistem Mesajı
        </label>
        <textarea
          value={formData.systemMessage || ''}
          onChange={(e) => setFormData({ ...formData, systemMessage: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
          placeholder="Agent'ın davranışını belirleyen sistem mesajı..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Güven Eşiği
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={formData.confidenceThreshold || 0.7}
          onChange={(e) => setFormData({ ...formData, confidenceThreshold: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">
          {((formData.confidenceThreshold || 0.7) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );

  const renderConditionSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Koşul Türü
        </label>
        <select
          value={formData.conditionType || 'value'}
          onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="value">Değer Karşılaştırma</option>
          <option value="text">Metin İçerik</option>
          <option value="number">Sayısal Karşılaştırma</option>
          <option value="exists">Varlık Kontrolü</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Koşul
        </label>
        <input
          type="text"
          value={formData.condition || ''}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Örn: confidence > 0.8"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          True Dalı Etiketi
        </label>
        <input
          type="text"
          value={formData.trueLabel || 'Doğru'}
          onChange={(e) => setFormData({ ...formData, trueLabel: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          False Dalı Etiketi
        </label>
        <input
          type="text"
          value={formData.falseLabel || 'Yanlış'}
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
          Bağlayıcı Türü
        </label>
        <select
          value={formData.connectorType || 'api'}
          onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="api">API İsteği</option>
          <option value="database">Veritabanı</option>
          <option value="email">E-posta</option>
          <option value="slack">Slack</option>
        </select>
      </div>

      {formData.connectorType === 'api' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API URL
            </label>
            <input
              type="text"
              value={formData.apiUrl || ''}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://api.example.com/endpoint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTTP Metodu
            </label>
            <select
              value={formData.method || 'GET'}
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
              value={formData.headers || '{}'}
              onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
              placeholder='{"Content-Type": "application/json"}'
            />
          </div>
        </>
      )}
    </div>
  );

  const renderNodeSettings = () => {
    switch (selectedNode.type) {
      case 'trigger':
        return renderTriggerSettings();
      case 'agent':
        return renderAgentSettings();
      case 'condition':
        return renderConditionSettings();
      case 'connector':
        return renderConnectorSettings();
      default:
        return <div className="text-gray-500">Bu node türü için ayar bulunmuyor.</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              {renderNodeIcon(selectedNode.type!)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Node Ayarları</h3>
              <p className="text-sm text-gray-500">{selectedNode.type} - {selectedNode.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Temel Ayarlar</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Adı
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Node adı..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-16"
                placeholder="Node açıklaması..."
              />
            </div>
          </div>
        </div>

        {/* Node-specific Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Özel Ayarlar</h4>
          {renderNodeSettings()}
        </div>

        {/* Advanced Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Gelişmiş Ayarlar</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="retryOnError"
                checked={formData.retryOnError || false}
                onChange={(e) => setFormData({ ...formData, retryOnError: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="retryOnError" className="text-sm text-gray-700">
                Hata durumunda yeniden dene
              </label>
            </div>

            {formData.retryOnError && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeniden deneme sayısı
                </label>
                <input
                  type="number"
                  value={formData.retryCount || 3}
                  onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                  className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (saniye)
              </label>
              <input
                type="number"
                value={formData.timeout || 30}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
} 