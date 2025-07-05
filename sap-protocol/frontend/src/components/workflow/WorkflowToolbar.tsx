import React from 'react';
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
  Settings
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export function WorkflowToolbar() {
  const { 
    workflows, 
    activeWorkflow, 
    isExecuting, 
    executeWorkflow, 
    createWorkflow,
    clearLogs 
  } = useWorkflowStore();

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
          onClick={handleSaveWorkflow}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          title="Save"
        >
          <Save className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleExportWorkflow}
          disabled={!activeWorkflow}
          className={`p-2 rounded-lg transition-colors ${
            !activeWorkflow
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleImportWorkflow}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
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
    </div>
  );
} 