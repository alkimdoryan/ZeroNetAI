/**
 * Agent Task Node
 * Executes AI agent tasks within workflow
 */

import { BaseNode, IExecutionContext } from './BaseNode.js';
import type { INodeExecutionData } from '../types/workflow.js';

export class AgentTaskNode extends BaseNode {
  readonly type = 'agentTask';
  readonly displayName = 'Agent Task';
  readonly description = 'Execute AI agent task';
  readonly group = 'agent';
  readonly version = 1;
  readonly inputs = ['main'];
  readonly outputs = ['main'];

  protected async executeNode(context: IExecutionContext): Promise<INodeExecutionData[][]> {
    const { 
      agentId, 
      taskDescription, 
      inputData, 
      timeout = 30000,
      retryOnFailure = true 
    } = context.node.parameters;

    const inputItems = this.getAllInputData(context);
    const results: INodeExecutionData[] = [];

    // Process each input item
    for (const item of inputItems) {
      try {
        // Resolve dynamic values from input
        const resolvedTaskDescription = this.resolveParameterValue(taskDescription, context, item);
        const resolvedInputData = this.resolveParameterValue(inputData, context, item);

        // Execute agent task
        const agentResult = await this.executeAgentTask({
          agentId: this.resolveParameterValue(agentId, context, item),
          taskDescription: resolvedTaskDescription,
          inputData: resolvedInputData,
          timeout,
          retryOnFailure,
          context: item.json,
        });

        results.push(this.createExecutionData({
          ...item.json,
          agentTask: {
            agentId,
            taskDescription: resolvedTaskDescription,
            result: agentResult.result,
            executionTime: agentResult.executionTime,
            status: agentResult.status,
            confidence: agentResult.confidence,
            metadata: agentResult.metadata,
          },
        }));

      } catch (error) {
        if (context.continueOnFail) {
          console.warn(`Agent task failed for item, continuing:`, error);
          results.push(this.createExecutionData({
            ...item.json,
            agentTask: {
              agentId,
              taskDescription,
              error: error instanceof Error ? error.message : String(error),
              status: 'failed',
            },
          }));
        } else {
          throw this.formatError(error, 'Agent task execution failed');
        }
      }
    }

    return [results];
  }

  private async executeAgentTask(params: {
    agentId: string;
    taskDescription: string;
    inputData?: any;
    timeout: number;
    retryOnFailure: boolean;
    context: Record<string, any>;
  }): Promise<{
    result: string;
    executionTime: number;
    status: 'success' | 'failed';
    confidence?: number;
    metadata?: Record<string, any>;
  }> {
    const startTime = Date.now();

    try {
      // In a real implementation, this would call the actual agent
      // For now, we'll simulate agent execution
      const result = await this.simulateAgentExecution(params);
      
      return {
        result: result.output,
        executionTime: Date.now() - startTime,
        status: 'success',
        confidence: result.confidence,
        metadata: {
          model: result.model,
          tokensUsed: result.tokensUsed,
          processingTime: result.processingTime,
        },
      };

    } catch (error) {
      if (params.retryOnFailure) {
        // Simple retry logic - in real implementation, this would be more sophisticated
        console.log(`Retrying agent task for agent ${params.agentId}...`);
        await this.delay(1000);
        
        try {
          const result = await this.simulateAgentExecution(params);
          return {
            result: result.output,
            executionTime: Date.now() - startTime,
            status: 'success',
            confidence: result.confidence,
            metadata: {
              ...result.metadata,
              retried: true,
            },
          };
        } catch (retryError) {
          // If retry also fails, throw the original error
        }
      }

      return {
        result: '',
        executionTime: Date.now() - startTime,
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async simulateAgentExecution(params: {
    agentId: string;
    taskDescription: string;
    inputData?: any;
    context: Record<string, any>;
  }): Promise<{
    output: string;
    confidence: number;
    model: string;
    tokensUsed: number;
    processingTime: number;
    metadata: Record<string, any>;
  }> {
    // Simulate network delay and processing time
    const processingTime = Math.random() * 2000 + 500; // 500-2500ms
    await this.delay(processingTime);

    // Simulate different types of agent responses based on task description
    let output: string;
    let confidence: number;

    if (params.taskDescription.toLowerCase().includes('sentiment')) {
      // Sentiment analysis simulation
      const sentiments = ['positive', 'negative', 'neutral'];
      output = sentiments[Math.floor(Math.random() * sentiments.length)];
      confidence = 0.7 + Math.random() * 0.3;
    } else if (params.taskDescription.toLowerCase().includes('summarize') || 
               params.taskDescription.toLowerCase().includes('summarize')) {
      // Text summarization simulation
      output = `Summary of the text: A brief summary containing the main points of ${params.inputData || 'the provided text'}.`;
      confidence = 0.8 + Math.random() * 0.2;
    } else if (params.taskDescription.toLowerCase().includes('classify') || 
               params.taskDescription.toLowerCase().includes('category')) {
      // Classification simulation
      const categories = ['technology', 'finance', 'health', 'education', 'entertainment'];
      output = categories[Math.floor(Math.random() * categories.length)];
      confidence = 0.75 + Math.random() * 0.25;
    } else {
      // Generic task simulation
      output = `Agent ${params.agentId} task completed: ${params.taskDescription}`;
      confidence = 0.6 + Math.random() * 0.4;
    }

    return {
      output,
      confidence,
      model: 'BitNet-Agent-v1.0',
      tokensUsed: Math.floor(Math.random() * 500) + 100,
      processingTime,
      metadata: {
        agentVersion: '1.0.0',
        zkVMProof: this.generateMockZkVMProof(),
        gasUsed: Math.floor(Math.random() * 50000) + 10000,
      },
    };
  }

  private generateMockZkVMProof(): string {
    // Generate a mock zkVM proof hash
    const chars = '0123456789abcdef';
    let proof = '0x';
    for (let i = 0; i < 64; i++) {
      proof += chars[Math.floor(Math.random() * 16)];
    }
    return proof;
  }
} 