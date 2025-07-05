/**
 * Base Node Class
 * All workflow nodes inherit from this base class
 */

import { v4 as uuid } from 'uuid';
import type { 
  WorkflowNode, 
  INodeExecutionData, 
  IExecutionError, 
  IRunData 
} from '../types/workflow.js';
import { validateNodeParameters } from '../types/schemas.js';

export interface IExecutionContext {
  workflow: {
    id: string;
    name: string;
    staticData: Record<string, any>;
  };
  execution: {
    id: string;
    mode: string;
  };
  inputData: INodeExecutionData[][];
  connectionInputData: Record<string, INodeExecutionData[][]>;
  node: WorkflowNode;
  continueOnFail: boolean;
  executeOnce: boolean;
}

export interface IExecutionResponse {
  data?: INodeExecutionData[][];
  error?: IExecutionError;
}

export abstract class BaseNode {
  abstract readonly type: string;
  abstract readonly displayName: string;
  abstract readonly description: string;
  abstract readonly group: string;
  abstract readonly version: number;
  abstract readonly inputs: string[];
  abstract readonly outputs: string[];

  /**
   * Execute the node with given context
   */
  async execute(context: IExecutionContext): Promise<IExecutionResponse> {
    const startTime = Date.now();
    
    try {
      // Validate node parameters
      const validation = validateNodeParameters(this.type, context.node.parameters);
      if (validation.error) {
        throw new Error(`Parameter validation failed: ${validation.error.message}`);
      }

      // Execute the node logic
      const result = await this.executeNode(context);
      
      return {
        data: result || [[]]
      };
    } catch (error) {
      const executionError: IExecutionError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'ExecutionError',
        description: `Error in node ${context.node.name} (${this.type})`,
        context: {
          nodeId: context.node.id,
          nodeType: this.type,
          parameters: context.node.parameters,
        },
        cause: error instanceof Error ? error : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
      };

      if (context.continueOnFail) {
        console.warn(`Node ${context.node.name} failed but continuing:`, executionError);
        return { data: [[]], error: executionError };
      }

      return { error: executionError };
    }
  }

  /**
   * Abstract method that each node must implement
   */
  protected abstract executeNode(context: IExecutionContext): Promise<INodeExecutionData[][]>;

  /**
   * Helper method to create execution data
   */
  protected createExecutionData(data: Record<string, any>): INodeExecutionData {
    return {
      json: data,
      pairedItem: { item: 0 }
    };
  }

  /**
   * Helper method to get input data safely
   */
  protected getInputData(context: IExecutionContext, inputIndex = 0, itemIndex = 0): INodeExecutionData | null {
    const inputData = context.inputData[inputIndex];
    if (!inputData || !inputData[itemIndex]) {
      return null;
    }
    return inputData[itemIndex];
  }

  /**
   * Helper method to get all input data
   */
  protected getAllInputData(context: IExecutionContext, inputIndex = 0): INodeExecutionData[] {
    const inputData = context.inputData[inputIndex];
    return inputData || [];
  }

  /**
   * Helper method to resolve parameter values from context
   */
  protected resolveParameterValue(
    value: any, 
    context: IExecutionContext, 
    inputData?: INodeExecutionData
  ): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Simple expression resolver - in real implementation, this would be more sophisticated
    if (value.startsWith('{{') && value.endsWith('}}')) {
      const expression = value.slice(2, -2).trim();
      
      // Handle input data references
      if (expression.startsWith('$json.') && inputData) {
        const path = expression.substring(6);
        return this.getNestedValue(inputData.json, path);
      }
      
      // Handle static data references
      if (expression.startsWith('$workflow.staticData.')) {
        const path = expression.substring(21);
        return this.getNestedValue(context.workflow.staticData, path);
      }
      
      // Handle node parameter references
      if (expression.startsWith('$node.')) {
        const path = expression.substring(6);
        return this.getNestedValue(context.node.parameters, path);
      }
    }

    return value;
  }

  /**
   * Helper method to get nested object values
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Helper method to wait/delay execution
   */
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper method to format error messages
   */
  protected formatError(error: any, context: string): Error {
    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`);
    }
    return new Error(`${context}: ${String(error)}`);
  }
} 