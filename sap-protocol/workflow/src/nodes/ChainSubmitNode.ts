/**
 * Chain Submit Node
 * Submits transactions to blockchain (smart contracts)
 */

import { BaseNode, IExecutionContext } from './BaseNode.js';
import type { INodeExecutionData } from '../types/workflow.js';

export class ChainSubmitNode extends BaseNode {
  readonly type = 'chainSubmit';
  readonly displayName = 'Chain Submit';
  readonly description = 'Submit transaction to blockchain';
  readonly group = 'blockchain';
  readonly version = 1;
  readonly inputs = ['main'];
  readonly outputs = ['main'];

  protected async executeNode(context: IExecutionContext): Promise<INodeExecutionData[][]> {
    const { 
      contractAddress, 
      functionName, 
      parameters = [], 
      gasLimit,
      value = '0' 
    } = context.node.parameters;

    const inputItems = this.getAllInputData(context);
    const results: INodeExecutionData[] = [];

    for (const item of inputItems) {
      try {
        // Resolve dynamic values from input
        const resolvedContractAddress = this.resolveParameterValue(contractAddress, context, item);
        const resolvedFunctionName = this.resolveParameterValue(functionName, context, item);
        const resolvedParameters = this.resolveParameterValue(parameters, context, item);
        const resolvedValue = this.resolveParameterValue(value, context, item);

        // Submit transaction
        const transactionResult = await this.submitTransaction({
          contractAddress: resolvedContractAddress,
          functionName: resolvedFunctionName,
          parameters: resolvedParameters,
          gasLimit: gasLimit,
          value: resolvedValue,
          inputData: item.json,
        });

        results.push(this.createExecutionData({
          ...item.json,
          chainSubmit: {
            contractAddress: resolvedContractAddress,
            functionName: resolvedFunctionName,
            parameters: resolvedParameters,
            transactionHash: transactionResult.transactionHash,
            blockNumber: transactionResult.blockNumber,
            gasUsed: transactionResult.gasUsed,
            status: transactionResult.status,
            receipt: transactionResult.receipt,
            timestamp: new Date().toISOString(),
          },
        }));

      } catch (error) {
        if (context.continueOnFail) {
          console.warn(`Chain submit failed for item, continuing:`, error);
          results.push(this.createExecutionData({
            ...item.json,
            chainSubmit: {
              contractAddress,
              functionName,
              error: error instanceof Error ? error.message : String(error),
              status: 'failed',
            },
          }));
        } else {
          throw this.formatError(error, 'Chain submit failed');
        }
      }
    }

    return [results];
  }

  private async submitTransaction(params: {
    contractAddress: string;
    functionName: string;
    parameters: any[];
    gasLimit?: number;
    value: string;
    inputData: Record<string, any>;
  }): Promise<{
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    status: 'success' | 'failed';
    receipt: Record<string, any>;
  }> {
    // Validate contract address
    if (!this.isValidEthereumAddress(params.contractAddress)) {
      throw new Error(`Invalid contract address: ${params.contractAddress}`);
    }

    // In a real implementation, this would use web3/ethers to submit transaction
    // For now, we'll simulate transaction submission
    return this.simulateTransactionSubmission(params);
  }

  private async simulateTransactionSubmission(params: {
    contractAddress: string;
    functionName: string;
    parameters: any[];
    gasLimit?: number;
    value: string;
    inputData: Record<string, any>;
  }): Promise<{
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    status: 'success' | 'failed';
    receipt: Record<string, any>;
  }> {
    // Simulate network delay
    const networkDelay = Math.random() * 3000 + 1000; // 1-4 seconds
    await this.delay(networkDelay);

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Transaction failed: insufficient gas or revert');
    }

    // Generate mock transaction data
    const transactionHash = this.generateTransactionHash();
    const blockNumber = Math.floor(Date.now() / 15000) + 18000000; // Simulate block numbers
    const gasUsed = params.gasLimit ? 
      Math.floor(params.gasLimit * (0.7 + Math.random() * 0.3)) : 
      Math.floor(Math.random() * 100000) + 21000;

    // Simulate different contract interactions
    let receipt: Record<string, any> = {
      transactionHash,
      blockNumber,
      gasUsed,
      cumulativeGasUsed: gasUsed + Math.floor(Math.random() * 50000),
      effectiveGasPrice: '20000000000', // 20 gwei
      status: 1,
      logs: [],
    };

    // Add specific logs based on function name
    if (params.functionName === 'submitResult') {
      receipt.logs.push({
        address: params.contractAddress,
        topics: [
          '0x1234567890abcdef...', // Event signature hash
          '0x' + params.parameters[0]?.toString().padStart(64, '0'), // Task ID
        ],
        data: '0x' + Buffer.from(params.parameters[1] || '').toString('hex'),
      });
    } else if (params.functionName === 'registerAgent') {
      receipt.logs.push({
        address: params.contractAddress,
        topics: [
          '0xabcdef1234567890...', // AgentRegistered event
        ],
        data: '0x' + Buffer.from(JSON.stringify({
          name: params.parameters[0],
          description: params.parameters[1],
        })).toString('hex'),
      });
    }

    return {
      transactionHash,
      blockNumber,
      gasUsed,
      status: 'success',
      receipt,
    };
  }

  private generateTransactionHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    return hash;
  }

  private isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Helper method to prepare function parameters
  private prepareFunctionParameters(
    functionName: string, 
    parameters: any[], 
    inputData: Record<string, any>
  ): any[] {
    switch (functionName) {
      case 'submitResult':
        // TaskBoard.submitResult(uint256 taskId, string result)
        return [
          parseInt(parameters[0] || inputData.taskId || '1'),
          parameters[1] || inputData.agentTask?.result || 'Task completed',
        ];

      case 'createTask':
        // TaskBoard.createTask(string description)
        return [
          parameters[0] || inputData.taskDescription || 'New task from workflow',
        ];

      case 'registerAgent':
        // AgentRegistry.registerAgent(string name, string description, string zkVMEndpoint, ...)
        return [
          parameters[0] || inputData.agentName || 'Workflow Agent',
          parameters[1] || inputData.agentDescription || 'Agent created by workflow',
          parameters[2] || inputData.zkVMEndpoint || 'https://zkvm.example.com',
          // Additional WorldID parameters would go here
        ];

      default:
        return parameters;
    }
  }
} 