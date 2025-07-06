import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Upload, 
  Download, 
  Undo, 
  Redo, 
  FileText,
  Plus,
  Settings,
  X
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { 
  isWorldIDBypassEnabled,
  WORLDID_BYPASS_CONFIG
} from '../../config/contracts';

interface WorkflowToolbarProps {
  onSave: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  disabled?: boolean;
}

export function WorkflowToolbar({ 
  onSave, 
  onLoad, 
  onExport, 
  onImport, 
  disabled = false 
}: WorkflowToolbarProps) {
  const { 
    workflows, 
    activeWorkflow, 
    isExecuting, 
    executeWorkflow, 
    createWorkflow,
    clearLogs 
  } = useWorkflowStore();
  const [showBypassConfig, setShowBypassConfig] = useState(false);

  const handleExecute = () => {
    if (activeWorkflow) {
      executeWorkflow(activeWorkflow);
    }
  };

  const handleNewWorkflow = () => {
    const name = prompt('Workflow name:');
    if (name) {
      createWorkflow(name, 'New workflow');
    }
  };

  const handleSaveWorkflow = () => {
    console.log('Workflow saved');
  };

  const handleExportWorkflow = () => {
    if (activeWorkflow) {
      const workflow = workflows.find(w => w.id === activeWorkflow);
      if (workflow) {
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `workflow-${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    }
  };

  const handleImportWorkflow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workflow = JSON.parse(e.target?.result as string);
            console.log('Imported workflow:', workflow);
            // Here we would add the workflow to the store
          } catch (error) {
            console.error('Error importing workflow:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center space-x-2">
      {/* WorldID Bypass Status */}
      {WORLDID_BYPASS_CONFIG.enabled && (
        <div className="flex items-center space-x-2 mr-4">
          <div className="flex items-center px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
            <span className="text-yellow-700 text-sm font-medium">
              🚀 WorldID Bypass Active
            </span>
          </div>
          <button
            onClick={() => setShowBypassConfig(!showBypassConfig)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configure WorldID Bypass"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Workflow Controls */}
      <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
        <button
          onClick={handleExecute}
          disabled={isExecuting || !activeWorkflow}
          className={`p-2 rounded-lg transition-colors ${
            isExecuting || !activeWorkflow
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-600 hover:bg-green-50'
          }`}
          title="Run workflow"
        >
          <Play className="w-5 h-5" />
        </button>
        
        <button
          onClick={clearLogs}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title="Stop"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>

      {/* File Operations */}
      <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
        <button
          onClick={handleNewWorkflow}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          title="New workflow"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        <button
          onClick={onSave}
          disabled={disabled}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          title="Save"
        >
          <Save className="w-5 h-5" />
        </button>
        
        <button
          onClick={onExport}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors ${
            disabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
        
        <button
          onClick={onImport}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors ${
            disabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-purple-600 hover:bg-purple-50'
          }`}
          title="Import"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      {/* Edit Operations */}
      <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Undo"
        >
          <Undo className="w-5 h-5" />
        </button>
        
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Redo"
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>

      {/* View Options */}
      <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Show logs"
        >
          <FileText className="w-5 h-5" />
        </button>
        
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Status Indicator */}
      {isExecuting && (
        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Running...</span>
        </div>
      )}

      {/* Bypass Configuration Panel */}
      {showBypassConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">WorldID Bypass Configuration</h3>
              <button
                onClick={() => setShowBypassConfig(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <p className="text-yellow-800 font-medium">Development Mode</p>
                </div>
                <p className="text-yellow-700 text-sm">
                  WorldID bypass is currently enabled for development and testing purposes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agent Registration</p>
                    <p className="text-xs text-gray-500">Skip WorldID for agent registration</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 ${WORLDID_BYPASS_CONFIG.agentRegistration ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${WORLDID_BYPASS_CONFIG.agentRegistration ? 'translate-x-4' : ''}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Workflow Save</p>
                    <p className="text-xs text-gray-500">Skip WorldID for workflow saving</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 ${WORLDID_BYPASS_CONFIG.workflowSave ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${WORLDID_BYPASS_CONFIG.workflowSave ? 'translate-x-4' : ''}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Custom Node Creation</p>
                    <p className="text-xs text-gray-500">Skip WorldID for custom nodes</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 ${WORLDID_BYPASS_CONFIG.customNodeCreation ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${WORLDID_BYPASS_CONFIG.customNodeCreation ? 'translate-x-4' : ''}`} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Mock Proof Data</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merkle Root:</span>
                    <span className="font-mono text-gray-800">{WORLDID_BYPASS_CONFIG.mockProof.merkle_root.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nullifier:</span>
                    <span className="font-mono text-gray-800">{WORLDID_BYPASS_CONFIG.mockProof.nullifier_hash.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-mono text-gray-800">{WORLDID_BYPASS_CONFIG.mockProof.verification_level}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBypassConfig(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 