/**
 * SAP Protocol Workflow Types
 * n8n-style workflow orchestrator type definitions
 */

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  parameters: Record<string, any>;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  retryTimes?: number;
  continueOnFail?: boolean;
}

export interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface WorkflowConnections {
  [key: string]: {
    main?: WorkflowConnection[][];
  };
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowSettings {
  executionTimeout?: number;
  saveExecutionProgress?: boolean;
  saveManualExecutions?: boolean;
  callerPolicy?: string;
  errorWorkflow?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook' | 'cron';
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'waiting';
  startedAt: Date;
  finishedAt?: Date;
  data?: WorkflowExecutionData;
  error?: string;
}

export interface WorkflowExecutionData {
  resultData: {
    runData: Record<string, IRunData[]>;
  };
  executionData?: {
    contextData: Record<string, any>;
    nodeExecutionStack: any[];
  };
}

export interface IRunData {
  startTime: number;
  executionTime: number;
  data?: {
    main: INodeExecutionData[][];
  };
  error?: IExecutionError;
}

export interface INodeExecutionData {
  json: Record<string, any>;
  binary?: Record<string, IBinaryData>;
  pairedItem?: {
    item: number;
    input?: number;
  };
}

export interface IBinaryData {
  data: string;
  mimeType: string;
  fileName?: string;
  directory?: string;
  fileExtension?: string;
  fileSize?: number;
}

export interface IExecutionError {
  message: string;
  name: string;
  description?: string;
  context?: Record<string, any>;
  cause?: Error;
  stack?: string;
  timestamp: Date;
}

// Node Types for SAP Protocol
export type NodeType = 
  | 'trigger'
  | 'agentTask'
  | 'chainSubmit'
  | 'chainRead'
  | 'condition'
  | 'delay'
  | 'httpRequest'
  | 'webhook'
  | 'cron'
  | 'eventEmitter';

export interface NodeTypeDescription {
  name: string;
  group: string;
  description: string;
  version: number;
  defaults: WorkflowNode;
  inputs: string[];
  outputs: string[];
  properties: NodeProperty[];
  credentials?: NodeCredential[];
}

export interface NodeProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'collection' | 'fixedCollection' | 'options' | 'multiOptions';
  default: any;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: Array<{
    name: string;
    value: any;
    description?: string;
  }>;
}

export interface NodeCredential {
  name: string;
  required?: boolean;
  displayOptions?: {
    show?: Record<string, any>;
    hide?: Record<string, any>;
  };
} 