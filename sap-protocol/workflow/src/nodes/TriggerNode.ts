/**
 * Trigger Node
 * Starts workflow execution based on various trigger types
 */

import { BaseNode, IExecutionContext } from './BaseNode.js';
import type { INodeExecutionData } from '../types/workflow.js';

export class TriggerNode extends BaseNode {
  readonly type = 'trigger';
  readonly displayName = 'Trigger';
  readonly description = 'Triggers workflow execution';
  readonly group = 'trigger';
  readonly version = 1;
  readonly inputs = [];
  readonly outputs = ['main'];

  protected async executeNode(context: IExecutionContext): Promise<INodeExecutionData[][]> {
    const { eventType, schedule, webhookPath } = context.node.parameters;

    switch (eventType) {
      case 'manual':
        return this.executeManualTrigger(context);
      
      case 'webhook':
        return this.executeWebhookTrigger(context, webhookPath);
      
      case 'cron':
        return this.executeCronTrigger(context, schedule);
      
      default:
        throw new Error(`Unsupported trigger type: ${eventType}`);
    }
  }

  private async executeManualTrigger(context: IExecutionContext): Promise<INodeExecutionData[][]> {
    // Manual trigger - just pass through initial data
    const triggerData = this.createExecutionData({
      trigger: 'manual',
      timestamp: new Date().toISOString(),
      workflowId: context.workflow.id,
      executionId: context.execution.id,
      mode: context.execution.mode,
    });

    return [[triggerData]];
  }

  private async executeWebhookTrigger(
    context: IExecutionContext, 
    webhookPath: string
  ): Promise<INodeExecutionData[][]> {
    // In a real implementation, this would handle webhook data
    // For now, we'll simulate webhook data
    const triggerData = this.createExecutionData({
      trigger: 'webhook',
      timestamp: new Date().toISOString(),
      webhookPath,
      // In real implementation, this would contain actual webhook payload
      payload: context.workflow.staticData?.webhookData || {},
      headers: context.workflow.staticData?.webhookHeaders || {},
      method: 'POST',
    });

    return [[triggerData]];
  }

  private async executeCronTrigger(
    context: IExecutionContext, 
    schedule: string
  ): Promise<INodeExecutionData[][]> {
    // Cron trigger - validate schedule and create trigger data
    if (!this.isValidCronExpression(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }

    const triggerData = this.createExecutionData({
      trigger: 'cron',
      timestamp: new Date().toISOString(),
      schedule,
      nextExecution: this.getNextCronExecution(schedule),
    });

    return [[triggerData]];
  }

  private isValidCronExpression(expression: string): boolean {
    // Basic cron validation - in real implementation, use a proper cron library
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
  }

  private getNextCronExecution(schedule: string): string {
    // Simplified next execution calculation
    // In real implementation, use a proper cron library like 'node-cron'
    const now = new Date();
    const nextExecution = new Date(now.getTime() + 60000); // Next minute
    return nextExecution.toISOString();
  }
} 