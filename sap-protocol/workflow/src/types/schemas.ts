/**
 * Workflow Validation Schemas using Joi
 */

import Joi from 'joi';

// Node Schema
export const WorkflowNodeSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  name: Joi.string().required(),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
  }).required(),
  parameters: Joi.object().default({}),
  executeOnce: Joi.boolean().default(false),
  retryOnFail: Joi.boolean().default(false),
  retryTimes: Joi.number().min(0).max(10).default(3),
  continueOnFail: Joi.boolean().default(false),
});

// Connection Schema
export const WorkflowConnectionSchema = Joi.object({
  node: Joi.string().required(),
  type: Joi.string().default('main'),
  index: Joi.number().min(0).default(0),
});

// Workflow Schema
export const WorkflowSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  active: Joi.boolean().default(false),
  nodes: Joi.array().items(WorkflowNodeSchema).min(1).required(),
  connections: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      main: Joi.array().items(
        Joi.array().items(WorkflowConnectionSchema)
      ).optional(),
    })
  ).required(),
  settings: Joi.object({
    executionTimeout: Joi.number().min(1000).max(3600000).default(300000), // 5 minutes default
    saveExecutionProgress: Joi.boolean().default(true),
    saveManualExecutions: Joi.boolean().default(true),
    callerPolicy: Joi.string().valid('any', 'workflowsFromSameOwner').default('any'),
    errorWorkflow: Joi.string().optional(),
  }).optional(),
  staticData: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date()),
});

// Execution Schema
export const WorkflowExecutionSchema = Joi.object({
  id: Joi.string().required(),
  workflowId: Joi.string().required(),
  mode: Joi.string().valid('manual', 'trigger', 'webhook', 'cron').required(),
  status: Joi.string().valid('new', 'running', 'success', 'error', 'canceled', 'waiting').default('new'),
  startedAt: Joi.date().default(() => new Date()),
  finishedAt: Joi.date().optional(),
  data: Joi.object().optional(),
  error: Joi.string().optional(),
});

// Node Type Validation Schemas
export const NodeTypeSchemas = {
  trigger: Joi.object({
    eventType: Joi.string().valid('manual', 'webhook', 'cron').required(),
    schedule: Joi.when('eventType', {
      is: 'cron',
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),
    webhookPath: Joi.when('eventType', {
      is: 'webhook',
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),
  }),

  agentTask: Joi.object({
    agentId: Joi.string().required(),
    taskDescription: Joi.string().min(1).max(1000).required(),
    inputData: Joi.object().optional(),
    timeout: Joi.number().min(1000).max(300000).default(30000),
    retryOnFailure: Joi.boolean().default(true),
  }),

  chainSubmit: Joi.object({
    contractAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    functionName: Joi.string().required(),
    parameters: Joi.array().optional(),
    gasLimit: Joi.number().min(21000).max(10000000).optional(),
    value: Joi.string().pattern(/^\d+$/).default('0'),
  }),

  chainRead: Joi.object({
    contractAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    functionName: Joi.string().required(),
    parameters: Joi.array().optional(),
    blockNumber: Joi.alternatives().try(
      Joi.string().valid('latest', 'earliest', 'pending'),
      Joi.number()
    ).default('latest'),
  }),

  condition: Joi.object({
    conditions: Joi.array().items(
      Joi.object({
        operation: Joi.string().valid('equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty').required(),
        leftValue: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()).required(),
        rightValue: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()).optional(),
      })
    ).min(1).required(),
    combineOperation: Joi.string().valid('AND', 'OR').default('AND'),
  }),

  delay: Joi.object({
    amount: Joi.number().min(1).required(),
    unit: Joi.string().valid('seconds', 'minutes', 'hours').default('seconds'),
  }),

  httpRequest: Joi.object({
    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
    url: Joi.string().uri().required(),
    headers: Joi.object().optional(),
    body: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
    timeout: Joi.number().min(1000).max(300000).default(30000),
  }),
};

// Helper function to validate workflow
export function validateWorkflow(workflow: any) {
  return WorkflowSchema.validate(workflow, { allowUnknown: false, stripUnknown: true });
}

// Helper function to validate node by type
export function validateNodeParameters(nodeType: string, parameters: any) {
  const schema = NodeTypeSchemas[nodeType as keyof typeof NodeTypeSchemas];
  if (!schema) {
    return { error: new Error(`Unknown node type: ${nodeType}`) };
  }
  return schema.validate(parameters, { allowUnknown: false, stripUnknown: true });
} 