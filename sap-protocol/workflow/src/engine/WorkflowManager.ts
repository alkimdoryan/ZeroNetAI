/**
 * Workflow Manager
 * Manages workflow storage, retrieval, and lifecycle
 */

import { v4 as uuid } from 'uuid';
import { EventEmitter } from 'events';
import type { Workflow, WorkflowExecution } from '../types/workflow.js';
import { validateWorkflow } from '../types/schemas.js';
import { WorkflowEngine } from './WorkflowEngine.js';

export interface WorkflowStorage {
  save(workflow: Workflow): Promise<void>;
  load(workflowId: string): Promise<Workflow | null>;
  loadAll(): Promise<Workflow[]>;
  delete(workflowId: string): Promise<boolean>;
  search(query: string): Promise<Workflow[]>;
}

// In-memory storage implementation (can be replaced with database storage)
export class InMemoryWorkflowStorage implements WorkflowStorage {
  private workflows = new Map<string, Workflow>();

  async save(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, { ...workflow });
  }

  async load(workflowId: string): Promise<Workflow | null> {
    const workflow = this.workflows.get(workflowId);
    return workflow ? { ...workflow } : null;
  }

  async loadAll(): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).map(w => ({ ...w }));
  }

  async delete(workflowId: string): Promise<boolean> {
    return this.workflows.delete(workflowId);
  }

  async search(query: string): Promise<Workflow[]> {
    const allWorkflows = await this.loadAll();
    const lowerQuery = query.toLowerCase();
    
    return allWorkflows.filter(workflow => 
      workflow.name.toLowerCase().includes(lowerQuery) ||
      workflow.description?.toLowerCase().includes(lowerQuery) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export class WorkflowManager extends EventEmitter {
  private engine: WorkflowEngine;
  private storage: WorkflowStorage;
  private activeWorkflows = new Map<string, Workflow>();

  constructor(storage?: WorkflowStorage) {
    super();
    this.engine = new WorkflowEngine();
    this.storage = storage || new InMemoryWorkflowStorage();

    // Forward engine events
    this.engine.on('execution:start', (execution) => {
      this.emit('execution:start', execution);
    });
    
    this.engine.on('execution:complete', (execution) => {
      this.emit('execution:complete', execution);
    });
    
    this.engine.on('execution:error', (execution, error) => {
      this.emit('execution:error', execution, error);
    });
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate workflow
    const validation = validateWorkflow(newWorkflow);
    if (validation.error) {
      throw new Error(`Invalid workflow: ${validation.error.message}`);
    }

    // Save to storage
    await this.storage.save(newWorkflow);
    
    // Store in active workflows if active
    if (newWorkflow.active) {
      this.activeWorkflows.set(newWorkflow.id, newWorkflow);
    }

    this.emit('workflow:created', newWorkflow);
    return newWorkflow;
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const existingWorkflow = await this.storage.load(workflowId);
    if (!existingWorkflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const updatedWorkflow: Workflow = {
      ...existingWorkflow,
      ...updates,
      id: workflowId, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    // Validate updated workflow
    const validation = validateWorkflow(updatedWorkflow);
    if (validation.error) {
      throw new Error(`Invalid workflow update: ${validation.error.message}`);
    }

    // Save to storage
    await this.storage.save(updatedWorkflow);
    
    // Update active workflows
    if (updatedWorkflow.active) {
      this.activeWorkflows.set(workflowId, updatedWorkflow);
    } else {
      this.activeWorkflows.delete(workflowId);
    }

    this.emit('workflow:updated', updatedWorkflow);
    return updatedWorkflow;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return await this.storage.load(workflowId);
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows(): Promise<Workflow[]> {
    return await this.storage.loadAll();
  }

  /**
   * Search workflows
   */
  async searchWorkflows(query: string): Promise<Workflow[]> {
    return await this.storage.search(query);
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<boolean> {
    const success = await this.storage.delete(workflowId);
    if (success) {
      this.activeWorkflows.delete(workflowId);
      this.emit('workflow:deleted', workflowId);
    }
    return success;
  }

  /**
   * Execute a workflow manually
   */
  async executeWorkflow(
    workflowId: string, 
    initialData?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const workflow = await this.storage.load(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return await this.engine.executeWorkflow(workflow, 'manual', initialData);
  }

  /**
   * Execute workflow by webhook trigger
   */
  async executeWorkflowByWebhook(
    webhookPath: string,
    webhookData: Record<string, any>
  ): Promise<WorkflowExecution[]> {
    const allWorkflows = await this.storage.loadAll();
    const results: WorkflowExecution[] = [];

    // Find workflows with webhook triggers for this path
    for (const workflow of allWorkflows) {
      if (!workflow.active) continue;

      const hasWebhookTrigger = workflow.nodes.some(node => 
        node.type === 'trigger' && 
        node.parameters.eventType === 'webhook' &&
        node.parameters.webhookPath === webhookPath
      );

      if (hasWebhookTrigger) {
        // Set webhook data in workflow static data
        const workflowWithWebhookData = {
          ...workflow,
          staticData: {
            ...workflow.staticData,
            webhookData,
          },
        };

        const execution = await this.engine.executeWorkflow(
          workflowWithWebhookData, 
          'webhook', 
          webhookData
        );
        results.push(execution);
      }
    }

    return results;
  }

  /**
   * Activate/deactivate a workflow
   */
  async setWorkflowActive(workflowId: string, active: boolean): Promise<Workflow> {
    return await this.updateWorkflow(workflowId, { active });
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): Workflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow execution history
   */
  getExecutionHistory(): WorkflowExecution[] {
    return this.engine.getExecutionHistory();
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return this.engine.getActiveExecutions();
  }

  /**
   * Cancel workflow execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    return await this.engine.cancelExecution(executionId);
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(workflowId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecution?: Date;
  }> {
    const executions = this.engine.getExecutionHistory()
      .filter(exec => exec.workflowId === workflowId);

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(exec => exec.status === 'success').length;
    const failedExecutions = executions.filter(exec => exec.status === 'error').length;
    
    const completedExecutions = executions.filter(exec => exec.finishedAt);
    const totalExecutionTime = completedExecutions.reduce((sum, exec) => {
      if (exec.finishedAt) {
        return sum + (exec.finishedAt.getTime() - exec.startedAt.getTime());
      }
      return sum;
    }, 0);
    
    const averageExecutionTime = completedExecutions.length > 0 ? 
      totalExecutionTime / completedExecutions.length : 0;

    const lastExecution = executions.length > 0 ? 
      executions[executions.length - 1].startedAt : undefined;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      lastExecution,
    };
  }

  /**
   * Load workflows from storage on startup
   */
  async initialize(): Promise<void> {
    const allWorkflows = await this.storage.loadAll();
    
    // Load active workflows into memory
    for (const workflow of allWorkflows) {
      if (workflow.active) {
        this.activeWorkflows.set(workflow.id, workflow);
      }
    }

    this.emit('manager:initialized', {
      totalWorkflows: allWorkflows.length,
      activeWorkflows: this.activeWorkflows.size,
    });
  }
} 