import React from 'react';
import { Play, Square, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export function WorkflowExecutionPanel() {
  const { 
    workflows, 
    activeWorkflow, 
    isExecuting, 
    executionLogs,
    executeWorkflow,
    clearLogs 
  } = useWorkflowStore();

  const handleExecute = () => {
    if (activeWorkflow) {
      executeWorkflow(activeWorkflow);
    }
  };

  const activeWorkflowData = workflows.find(w => w.id === activeWorkflow);

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Workflow Çalıştırma</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting || !activeWorkflow}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isExecuting || !activeWorkflow
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Çalıştır</span>
          </button>
          
          <button
            onClick={clearLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {/* Workflow Info */}
      {activeWorkflowData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              🔄
            </div>
            <div>
              <h4 className="font-medium text-blue-900">{activeWorkflowData.name}</h4>
              <p className="text-sm text-blue-600">{activeWorkflowData.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-blue-600">
            <span>Nodes: {activeWorkflowData.nodes.length}</span>
            <span>Bağlantılar: {activeWorkflowData.edges.length}</span>
            <span>Durum: {activeWorkflowData.isActive ? 'Aktif' : 'Pasif'}</span>
          </div>
        </div>
      )}

      {/* Execution Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            isExecuting ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            {isExecuting ? 'Çalışıyor...' : 'Hazır'}
          </span>
        </div>
        
        {isExecuting && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-green-400 text-sm font-medium">Execution Logs</span>
        </div>
        
        {executionLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz log bulunmuyor...</p>
        ) : (
          <div className="space-y-2">
            {executionLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-gray-400 text-xs mt-1">
                  [{new Date().toLocaleTimeString()}]
                </div>
                <div className="flex items-center space-x-2">
                  {log.includes('Hata') ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : log.includes('tamamlandı') ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : log.includes('başlatıldı') ? (
                    <Play className="w-4 h-4 text-blue-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-white text-sm">{log}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
          Şablon Yükle
        </button>
        <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
          Test Verisi
        </button>
        <button className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
          Debug Mode
        </button>
      </div>
    </div>
  );
} 