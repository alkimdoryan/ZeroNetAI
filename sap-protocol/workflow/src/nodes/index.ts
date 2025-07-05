/**
 * Workflow Nodes Export
 */

export { BaseNode } from './BaseNode.js';
export type { IExecutionContext, IExecutionResponse } from './BaseNode.js';
export { TriggerNode } from './TriggerNode.js';
export { AgentTaskNode } from './AgentTaskNode.js';
export { ChainSubmitNode } from './ChainSubmitNode.js';

// Node registry for dynamic loading
import { BaseNode } from './BaseNode.js';
import { TriggerNode } from './TriggerNode.js';
import { AgentTaskNode } from './AgentTaskNode.js';
import { ChainSubmitNode } from './ChainSubmitNode.js';

export const NodeRegistry: Record<string, typeof BaseNode> = {
  trigger: TriggerNode,
  agentTask: AgentTaskNode,
  chainSubmit: ChainSubmitNode,
};

// Helper function to create node instance
export function createNodeInstance(nodeType: string): BaseNode {
  const NodeClass = NodeRegistry[nodeType];
  if (!NodeClass) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }
  return new (NodeClass as any)();
}

// Get available node types
export function getAvailableNodeTypes(): string[] {
  return Object.keys(NodeRegistry);
} 