import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'agent' | 'condition' | 'connector';
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface WorkflowState {
  workflows: Workflow[];
  activeWorkflow: string | null;
  selectedNode: string | null;
  isExecuting: boolean;
  executionLogs: string[];
}

interface WorkflowActions {
  createWorkflow: (name: string, description?: string) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveWorkflow: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (id: string) => void;
  executeWorkflow: (id: string) => Promise<void>;
  clearLogs: () => void;
}

export const useWorkflowStore = create<WorkflowState & WorkflowActions>()(
  immer((set, get) => ({
    // State
    workflows: [],
    activeWorkflow: null,
    selectedNode: null,
    isExecuting: false,
    executionLogs: [],

    // Actions
    createWorkflow: (name: string, description = '') => {
      set((state) => {
        const workflow: Workflow = {
          id: `workflow-${Date.now()}`,
          name,
          description,
          nodes: [],
          edges: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: false,
        };
        state.workflows.push(workflow);
        state.activeWorkflow = workflow.id;
      });
    },

    updateWorkflow: (id: string, updates: Partial<Workflow>) => {
      set((state) => {
        const workflow = state.workflows.find((w) => w.id === id);
        if (workflow) {
          Object.assign(workflow, updates);
          workflow.updatedAt = new Date();
        }
      });
    },

    deleteWorkflow: (id: string) => {
      set((state) => {
        state.workflows = state.workflows.filter((w) => w.id !== id);
        if (state.activeWorkflow === id) {
          state.activeWorkflow = null;
        }
      });
    },

    setActiveWorkflow: (id: string | null) => {
      set((state) => {
        state.activeWorkflow = id;
      });
    },

    setSelectedNode: (id: string | null) => {
      set((state) => {
        state.selectedNode = id;
      });
    },

    addNode: (node: WorkflowNode) => {
      set((state) => {
        const workflow = state.workflows.find((w) => w.id === state.activeWorkflow);
        if (workflow) {
          workflow.nodes.push(node);
          workflow.updatedAt = new Date();
        }
      });
    },

    updateNode: (id: string, updates: Partial<WorkflowNode>) => {
      set((state) => {
        const workflow = state.workflows.find((w) => w.id === state.activeWorkflow);
        if (workflow) {
          const node = workflow.nodes.find((n) => n.id === id);
          if (node) {
            Object.assign(node, updates);
            workflow.updatedAt = new Date();
          }
        }
      });
    },

    deleteNode: (id: string) => {
      set((state) => {
        const workflow = state.workflows.find((w) => w.id === state.activeWorkflow);
        if (workflow) {
          workflow.nodes = workflow.nodes.filter((n) => n.id !== id);
          workflow.edges = workflow.edges.filter((e) => e.source !== id && e.target !== id);
          workflow.updatedAt = new Date();
        }
      });
    },

    addEdge: (edge: WorkflowEdge) => {
      set((state) => {
        const workflow = state.workflows.find((w) => w.id === state.activeWorkflow);
        if (workflow) {
          workflow.edges.push(edge);
          workflow.updatedAt = new Date();
        }
      });
    },

    deleteEdge: (id: string) => {
      set((state) => {
        const workflow = state.workflows.find((w) => w.id === state.activeWorkflow);
        if (workflow) {
          workflow.edges = workflow.edges.filter((e) => e.id !== id);
          workflow.updatedAt = new Date();
        }
      });
    },

    executeWorkflow: async (id: string) => {
      set((state) => {
        state.isExecuting = true;
        state.executionLogs = [];
      });

      try {
        const workflow = get().workflows.find((w) => w.id === id);
        if (!workflow) {
          throw new Error('Workflow bulunamadı');
        }

        // Simulate workflow execution
        set((state) => {
          state.executionLogs.push(`Workflow "${workflow.name}" başlatıldı`);
        });

        // Execute nodes in order (simplified)
        for (const node of workflow.nodes) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing
          set((state) => {
            state.executionLogs.push(`${node.data.label} işlendi`);
          });
        }

        set((state) => {
          state.executionLogs.push('Workflow başarıyla tamamlandı');
        });
      } catch (error) {
        set((state) => {
          state.executionLogs.push(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        });
      } finally {
        set((state) => {
          state.isExecuting = false;
        });
      }
    },

    clearLogs: () => {
      set((state) => {
        state.executionLogs = [];
      });
    },
  }))
); 