/**
 * Workflow Execution Engine
 * Orchestrates the execution of workflow nodes
 */

import { v4 as uuid } from 'uuid';
import { EventEmitter } from 'events';
import type {
  Workflow,
  WorkflowExecution,
  WorkflowNode,
  WorkflowConnections,
  INodeExecutionData,
  IExecutionError,
} from '../types/workflow.js';
import { createNodeInstance } from '../nodes/index.js';
import type { IExecutionContext } from '../nodes/BaseNode.js';

export interface WorkflowEngineEvents {
  'execution:start': (execution: WorkflowExecution) => void;
  'execution:complete': (execution: WorkflowExecution) => void;
  'execution:error': (execution: WorkflowExecution, error: IExecutionError) => void;
  'node:start': (nodeId: string, execution: WorkflowExecution) => void;
  'node:complete': (nodeId: string, execution: WorkflowExecution, data: INodeExecutionData[][]) => void;
  'node:error': (nodeId: string, execution: WorkflowExecution, error: IExecutionError) => void;
}

export class WorkflowEngine extends EventEmitter {
  private activeExecutions = new Map<string, WorkflowExecution>();
  private executionHistory: WorkflowExecution[] = [];

  constructor() {
    super();
    this.setMaxListeners(1000); // Allow many listeners
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    mode: 'manual' | 'trigger' | 'webhook' | 'cron' = 'manual',
    initialData?: Record<string, any>
  ): Promise<WorkflowExecution> {
    // Create execution record
    const execution: WorkflowExecution = {
      id: uuid(),
      workflowId: workflow.id,
      mode,
      status: 'new',
      startedAt: new Date(),
      data: {
        resultData: {
          runData: {},
        },
        executionData: {
          contextData: initialData || {},
          nodeExecutionStack: [],
        },
      },
    };

    this.activeExecutions.set(execution.id, execution);
    this.emit('execution:start', execution);

    try {
      // Start execution
      execution.status = 'running';
      
      // Execute workflow nodes
      await this.executeNodes(workflow, execution);
      
      // Mark as completed
      execution.status = 'success';
      execution.finishedAt = new Date();
      
      this.emit('execution:complete', execution);
      
    } catch (error) {
      // Handle execution error
      const executionError: IExecutionError = {
        message: error instanceof Error ? error.message : 'Unknown execution error',
        name: error instanceof Error ? error.name : 'ExecutionError',
        description: 'Workflow execution failed',
        timestamp: new Date(),
        cause: error instanceof Error ? error : undefined,
      };

      execution.status = 'error';
      execution.error = executionError.message;
      execution.finishedAt = new Date();
      
      this.emit('execution:error', execution, executionError);
    } finally {
      // Clean up
      this.activeExecutions.delete(execution.id);
      this.executionHistory.push(execution);
      
      // Keep only last 100 executions in memory
      if (this.executionHistory.length > 100) {
        this.executionHistory = this.executionHistory.slice(-100);
      }
    }

    return execution;
  }

  /**
   * Execute workflow nodes in correct order
   */
  private async executeNodes(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    const { nodes, connections } = workflow;
    const executedNodes = new Set<string>();
    const nodeOutputs = new Map<string, INodeExecutionData[][]>();

    // Find starting nodes (trigger nodes or nodes with no inputs)
    const startingNodes = this.findStartingNodes(nodes, connections);
    
    if (startingNodes.length === 0) {
      throw new Error('No starting nodes found in workflow');
    }

    // Execute nodes starting from trigger/starting nodes
    const executionQueue: { node: WorkflowNode; inputData: Record<string, INodeExecutionData[][]> }[] = 
      startingNodes.map(node => ({ node, inputData: {} }));

    while (executionQueue.length > 0) {
      const { node, inputData } = executionQueue.shift()!;
      
      if (executedNodes.has(node.id)) {
        continue; // Skip already executed nodes
      }

      try {
        this.emit('node:start', node.id, execution);

        // Execute the node
        const nodeOutput = await this.executeNode(node, workflow, execution, inputData);
        
        // Store output for connected nodes
        nodeOutputs.set(node.id, nodeOutput);
        executedNodes.add(node.id);

        // Store execution data
        if (!execution.data!.resultData.runData[node.id]) {
          execution.data!.resultData.runData[node.id] = [];
        }
        execution.data!.resultData.runData[node.id].push({
          startTime: Date.now(),
          executionTime: 100, // This would be calculated properly
          data: { main: nodeOutput },
        });

        this.emit('node:complete', node.id, execution, nodeOutput);

        // Find and queue connected nodes
        const connectedNodes = this.getConnectedNodes(node.id, connections, nodes);
        for (const connectedNode of connectedNodes) {
          if (!executedNodes.has(connectedNode.id)) {
            // Prepare input data for connected node
            const connectedInputData: Record<string, INodeExecutionData[][]> = {};
            connectedInputData[node.id] = nodeOutput;
            
            executionQueue.push({ 
              node: connectedNode, 
              inputData: connectedInputData 
            });
          }
        }

      } catch (error) {
        const nodeError: IExecutionError = {
          message: error instanceof Error ? error.message : 'Node execution failed',
          name: error instanceof Error ? error.name : 'NodeError',
          description: `Error executing node ${node.name} (${node.type})`,
          context: { nodeId: node.id, nodeType: node.type },
          timestamp: new Date(),
          cause: error instanceof Error ? error : undefined,
        };

        this.emit('node:error', node.id, execution, nodeError);

        if (!node.continueOnFail) {
          throw nodeError;
        }

        // Continue execution even with error
        executedNodes.add(node.id);
        nodeOutputs.set(node.id, [[]]);
      }
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    workflow: Workflow,
    execution: WorkflowExecution,
    connectionInputData: Record<string, INodeExecutionData[][]>
  ): Promise<INodeExecutionData[][]> {
    // Create node instance
    const nodeInstance = createNodeInstance(node.type);

    // Prepare execution context
    const context: IExecutionContext = {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        staticData: workflow.staticData || {},
      },
      execution: {
        id: execution.id,
        mode: execution.mode,
      },
      inputData: Object.values(connectionInputData)[0] || [[]],
      connectionInputData,
      node,
      continueOnFail: node.continueOnFail || false,
      executeOnce: node.executeOnce || false,
    };

    // Execute the node
    const result = await nodeInstance.execute(context);
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data || [[]];
  }

  /**
   * Find starting nodes in workflow
   */
  private findStartingNodes(nodes: WorkflowNode[], connections: WorkflowConnections): WorkflowNode[] {
    const hasIncomingConnections = new Set<string>();
    
    // Find nodes that have incoming connections
    Object.values(connections).forEach(nodeConnections => {
      if (nodeConnections.main) {
        nodeConnections.main.forEach(connectionGroup => {
          connectionGroup.forEach(connection => {
            hasIncomingConnections.add(connection.node);
          });
        });
      }
    });

    // Return nodes without incoming connections or trigger nodes
    return nodes.filter(node => 
      !hasIncomingConnections.has(node.id) || node.type === 'trigger'
    );
  }

  /**
   * Get nodes connected to a specific node
   */
  private getConnectedNodes(
    sourceNodeId: string,
    connections: WorkflowConnections,
    allNodes: WorkflowNode[]
  ): WorkflowNode[] {
    const connectedNodeIds = new Set<string>();
    
    const sourceConnections = connections[sourceNodeId];
    if (sourceConnections?.main) {
      sourceConnections.main.forEach(connectionGroup => {
        connectionGroup.forEach(connection => {
          connectedNodeIds.add(connection.node);
        });
      });
    }

    return allNodes.filter(node => connectedNodeIds.has(node.id));
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): WorkflowExecution[] {
    return [...this.executionHistory];
  }

  /**
   * Cancel an active execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return false;
    }

    execution.status = 'canceled';
    execution.finishedAt = new Date();
    
    this.activeExecutions.delete(executionId);
    this.executionHistory.push(execution);
    
    return true;
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId) || 
           this.executionHistory.find(exec => exec.id === executionId);
  }
} 