/**
 * Workflow System Tests
 * Test suite for the SAP Protocol Workflow Orchestrator
 */

import SAPWorkflowOrchestrator from '../src/index.js';
import type { Workflow, WorkflowNode, WorkflowConnections } from '../src/types/workflow.js';

// Test helper functions
function createTestWorkflow(): {
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
} {
  const nodes: WorkflowNode[] = [
    {
      id: 'trigger-1',
      type: 'trigger',
      name: 'Manual Trigger',
      position: { x: 100, y: 100 },
      parameters: {
        eventType: 'manual',
      },
    },
    {
      id: 'agent-1',
      type: 'agentTask',
      name: 'Sentiment Analysis',
      position: { x: 300, y: 100 },
      parameters: {
        agentId: 'sentiment-agent-1',
        taskDescription: 'Analyze sentiment of: {{$json.text}}',
        timeout: 30000,
      },
    },
    {
      id: 'chain-1',
      type: 'chainSubmit',
      name: 'Submit to TaskBoard',
      position: { x: 500, y: 100 },
      parameters: {
        contractAddress: '0x1234567890123456789012345678901234567890',
        functionName: 'submitResult',
        parameters: ['{{$json.taskId}}', '{{$json.agentTask.result}}'],
      },
    },
  ];

  const connections: WorkflowConnections = {
    'trigger-1': {
      main: [
        [
          { node: 'agent-1', type: 'main', index: 0 },
        ],
      ],
    },
    'agent-1': {
      main: [
        [
          { node: 'chain-1', type: 'main', index: 0 },
        ],
      ],
    },
  };

  return { nodes, connections };
}

// Tests
async function testWorkflowCreation() {
  console.log('🧪 Testing workflow creation...');
  
  const orchestrator = new SAPWorkflowOrchestrator();
  await orchestrator.initialize();
  
  const { nodes, connections } = createTestWorkflow();
  
  const workflow = await orchestrator.getManager().createWorkflow({
    name: 'Test Sentiment Analysis Workflow',
    description: 'Analyzes sentiment and submits to blockchain',
    active: true,
    nodes,
    connections,
  });
  
  console.log('✅ Workflow created successfully:', workflow.id);
  console.log(`   - Name: ${workflow.name}`);
  console.log(`   - Nodes: ${workflow.nodes.length}`);
  console.log(`   - Active: ${workflow.active}`);
  
  return workflow;
}

async function testWorkflowExecution() {
  console.log('\n🧪 Testing workflow execution...');
  
  const orchestrator = new SAPWorkflowOrchestrator();
  await orchestrator.initialize();
  
  const { nodes, connections } = createTestWorkflow();
  
  const workflow = await orchestrator.getManager().createWorkflow({
    name: 'Test Execution Workflow',
    description: 'Tests workflow execution flow',
    active: true,
    nodes,
    connections,
  });
  
  // Execute workflow with test data
  const execution = await orchestrator.getManager().executeWorkflow(workflow.id, {
    text: 'Bu harika bir proje! Çok başarılı olacak.',
    taskId: 1,
  });
  
  console.log('✅ Workflow executed successfully:', execution.id);
  console.log(`   - Status: ${execution.status}`);
  console.log(`   - Started: ${execution.startedAt.toISOString()}`);
  console.log(`   - Finished: ${execution.finishedAt?.toISOString() || 'Running'}`);
  
  // Wait for completion
  if (execution.status === 'running') {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return execution;
}

async function testMultipleWorkflows() {
  console.log('\n🧪 Testing multiple workflows...');
  
  const orchestrator = new SAPWorkflowOrchestrator();
  await orchestrator.initialize();
  
  const workflows = [];
  
  // Create multiple test workflows
  for (let i = 1; i <= 3; i++) {
    const { nodes, connections } = createTestWorkflow();
    
    const workflow = await orchestrator.getManager().createWorkflow({
      name: `Test Workflow ${i}`,
      description: `Test workflow number ${i}`,
      active: i <= 2, // Only first 2 active
      nodes,
      connections,
      tags: [`test-${i}`, 'demo'],
    });
    
    workflows.push(workflow);
  }
  
  console.log('✅ Created multiple workflows:', workflows.length);
  
  // Test search functionality
  const searchResults = await orchestrator.getManager().searchWorkflows('test');
  console.log(`   - Search results for 'test': ${searchResults.length}`);
  
  const activeWorkflows = orchestrator.getManager().getActiveWorkflows();
  console.log(`   - Active workflows: ${activeWorkflows.length}`);
  
  return workflows;
}

async function testWorkflowStats() {
  console.log('\n🧪 Testing workflow statistics...');
  
  const orchestrator = new SAPWorkflowOrchestrator();
  await orchestrator.initialize();
  
  const { nodes, connections } = createTestWorkflow();
  
  const workflow = await orchestrator.getManager().createWorkflow({
    name: 'Stats Test Workflow',
    description: 'Workflow for testing statistics',
    active: true,
    nodes,
    connections,
  });
  
  // Execute workflow a few times
  for (let i = 0; i < 3; i++) {
    await orchestrator.getManager().executeWorkflow(workflow.id, {
      text: `Test message ${i + 1}`,
      taskId: i + 1,
    });
  }
  
  // Get stats
  const stats = await orchestrator.getManager().getWorkflowStats(workflow.id);
  console.log('✅ Workflow statistics:');
  console.log(`   - Total executions: ${stats.totalExecutions}`);
  console.log(`   - Successful: ${stats.successfulExecutions}`);
  console.log(`   - Failed: ${stats.failedExecutions}`);
  console.log(`   - Average time: ${stats.averageExecutionTime.toFixed(2)}ms`);
  console.log(`   - Last execution: ${stats.lastExecution?.toISOString() || 'None'}`);
  
  return stats;
}

async function testSentimentAnalysisWorkflow() {
  console.log('\n🧪 Testing SAP Protocol Sentiment Analysis Demo...');
  
  const orchestrator = new SAPWorkflowOrchestrator();
  await orchestrator.initialize();
  
  // Create a comprehensive sentiment analysis workflow
  const nodes: WorkflowNode[] = [
    {
      id: 'trigger-sentiment',
      type: 'trigger',
      name: 'Sentiment Trigger',
      position: { x: 50, y: 200 },
      parameters: {
        eventType: 'manual',
      },
    },
    {
      id: 'sentiment-agent',
      type: 'agentTask',
      name: 'AI Sentiment Agent',
      position: { x: 250, y: 200 },
      parameters: {
        agentId: 'bitnet-sentiment-v1',
        taskDescription: 'Analyze sentiment of Turkish text: {{$json.tweetText}}',
        timeout: 30000,
        retryOnFailure: true,
      },
    },
    {
      id: 'taskboard-submit',
      type: 'chainSubmit',
      name: 'Submit to TaskBoard',
      position: { x: 450, y: 200 },
      parameters: {
        contractAddress: '0x1234567890123456789012345678901234567890',
        functionName: 'submitResult',
        parameters: ['{{$json.taskId}}', '{{$json.agentTask.result}}'],
        gasLimit: 200000,
      },
    },
  ];
  
  const connections: WorkflowConnections = {
    'trigger-sentiment': {
      main: [
        [
          { node: 'sentiment-agent', type: 'main', index: 0 },
        ],
      ],
    },
    'sentiment-agent': {
      main: [
        [
          { node: 'taskboard-submit', type: 'main', index: 0 },
        ],
      ],
    },
  };
  
  const workflow = await orchestrator.getManager().createWorkflow({
    name: 'SAP Protocol Sentiment Analysis',
    description: 'Hourly sentiment analysis of Turkish crypto tweets using BitNet LLM',
    active: true,
    nodes,
    connections,
    tags: ['sentiment', 'turkish', 'crypto', 'demo'],
  });
  
  console.log('✅ Created SAP Protocol Demo Workflow:', workflow.id);
  
  // Test with various Turkish texts
  const testTexts = [
    'Bitcoin bugün harika bir performans sergiliyor! 🚀',
    'Kripto piyasası çok volatil, dikkatli olmak gerek.',
    'Blockchain teknolojisi geleceğin teknolojisi.',
    'Bu düşüş çok üzücü, portföyüm eridi.',
    'SAP Protocol çok yenilikçi bir proje!',
  ];
  
  for (let i = 0; i < testTexts.length; i++) {
    const execution = await orchestrator.getManager().executeWorkflow(workflow.id, {
      tweetText: testTexts[i],
      taskId: i + 1,
      source: 'twitter',
      timestamp: new Date().toISOString(),
    });
    
    console.log(`   📝 Processed: "${testTexts[i]}" (${execution.id})`);
  }
  
  return workflow;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SAP Protocol Workflow Orchestrator Tests\n');
  
  try {
    await testWorkflowCreation();
    await testWorkflowExecution();
    await testMultipleWorkflows();
    await testWorkflowStats();
    await testSentimentAnalysisWorkflow();
    
    console.log('\n🎉 All tests completed successfully!');
    
    // Show final statistics
    const orchestrator = new SAPWorkflowOrchestrator();
    await orchestrator.initialize();
    const stats = await orchestrator.getStats();
    
    console.log('\n📊 Final Statistics:');
    console.log(`   - Total workflows: ${stats.totalWorkflows}`);
    console.log(`   - Active workflows: ${stats.activeWorkflows}`);
    console.log(`   - Total executions: ${stats.totalExecutions}`);
    console.log(`   - Active executions: ${stats.activeExecutions}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Export for individual testing
export {
  testWorkflowCreation,
  testWorkflowExecution,
  testMultipleWorkflows,
  testWorkflowStats,
  testSentimentAnalysisWorkflow,
  runAllTests,
};

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
} 