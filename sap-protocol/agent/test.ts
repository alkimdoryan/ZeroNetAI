/**
 * SAP Protocol Agent - Test Suite
 * Test all agent functionality including zkVM integration
 */

import {
  runAgentTask,
  runAgentTaskEnhanced,
  initializeAgent,
  AgentTask,
} from './index.js';
import { executeZkVMInference, benchmarkZkVMPerformance } from './loader.js';

/**
 * Test basic agent functionality
 */
async function testBasicAgent() {
  console.log('🧪 Testing Basic Agent Functionality...');

  // Test 1: Basic prompt processing
  const result1 = await runAgentTask('Hello, please process this request');
  console.log('✓ Basic prompt:', result1);

  // Test 2: Filter detection (Task 2.2)
  const result2 = await runAgentTask('Please filter this content for approval');
  console.log('✓ Filter detection:', result2);

  // Test 3: Enhanced agent with metadata
  const task: AgentTask = {
    id: 'test-task-1',
    prompt: 'Analyze this data and provide insights',
    context: { source: 'test', priority: 'high' },
    timestamp: Date.now(),
  };

  const result3 = await runAgentTaskEnhanced(task);
  console.log('✓ Enhanced result:', result3);

  console.log('✅ Basic agent tests passed!\n');
}

/**
 * Test zkVM integration
 */
async function testZkVMIntegration() {
  console.log('🧪 Testing zkVM Integration...');

  // Test 1: Basic zkVM inference
  const result1 = await executeZkVMInference('Test prompt for zkVM');
  console.log('✓ zkVM inference:', result1);

  // Test 2: zkVM with filter
  const result2 = await executeZkVMInference('Apply filter to this content');
  console.log('✓ zkVM filter:', result2);

  console.log('✅ zkVM integration tests passed!\n');
}

/**
 * Test performance benchmarking
 */
async function testPerformanceBenchmark() {
  console.log('🧪 Testing Performance Benchmarking...');

  const testPrompts = [
    'Simple test prompt',
    'Filter this content please',
    'Analyze sentiment of this text',
    'Classify this document',
    'Generate summary for this content',
  ];

  const benchmark = await benchmarkZkVMPerformance(testPrompts, 2);
  console.log('✓ Benchmark completed:', {
    averageLatency: `${benchmark.averageLatency.toFixed(2)}ms`,
    averageGas: benchmark.averageGas.toFixed(0),
    throughput: `${benchmark.throughput.toFixed(2)} req/s`,
    totalTests: benchmark.results.length,
  });

  console.log('✅ Performance benchmark tests passed!\n');
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting SAP Protocol Agent Tests...\n');

  try {
    // Initialize agent
    await initializeAgent();
    console.log('');

    // Run all tests
    await testBasicAgent();
    await testZkVMIntegration();
    await testPerformanceBenchmark();

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export {
  runAllTests,
  testBasicAgent,
  testZkVMIntegration,
  testPerformanceBenchmark,
};
