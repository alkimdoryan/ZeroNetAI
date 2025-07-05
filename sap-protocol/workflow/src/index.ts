/**
 * SAP Protocol Workflow Orchestrator
 * Main entry point for the workflow system
 */

// Core types
export * from './types/workflow.js';
export * from './types/schemas.js';

// Nodes
export * from './nodes/index.js';

// Engine
export { WorkflowEngine } from './engine/WorkflowEngine.js';
export { WorkflowManager, InMemoryWorkflowStorage } from './engine/WorkflowManager.js';
export type { WorkflowStorage } from './engine/WorkflowManager.js';

// Default export with convenience methods
import { WorkflowManager } from './engine/WorkflowManager.js';

export default class SAPWorkflowOrchestrator {
  private manager: WorkflowManager;

  constructor(storage?: any) {
    this.manager = new WorkflowManager(storage);
  }

  /**
   * Initialize the workflow system
   */
  async initialize(): Promise<void> {
    await this.manager.initialize();
  }

  /**
   * Get the workflow manager instance
   */
  getManager(): WorkflowManager {
    return this.manager;
  }

  /**
   * Create and execute a simple workflow
   */
  async createAndExecuteWorkflow(
    name: string,
    description: string,
    nodes: any[],
    connections: any
  ): Promise<any> {
    const workflow = await this.manager.createWorkflow({
      name,
      description,
      active: true,
      nodes,
      connections,
    });

    return await this.manager.executeWorkflow(workflow.id);
  }

  /**
   * Get workflow execution statistics
   */
  async getStats(): Promise<{
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    activeExecutions: number;
  }> {
    const allWorkflows = await this.manager.getAllWorkflows();
    const activeWorkflows = this.manager.getActiveWorkflows();
    const executionHistory = this.manager.getExecutionHistory();
    const activeExecutions = this.manager.getActiveExecutions();

    return {
      totalWorkflows: allWorkflows.length,
      activeWorkflows: activeWorkflows.length,
      totalExecutions: executionHistory.length,
      activeExecutions: activeExecutions.length,
    };
  }
} 