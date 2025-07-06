// zkVM Configuration for LLM Integration
export const zkVMConfig = {
  // Default zkVM endpoint
  defaultEndpoint: import.meta.env.VITE_ZKVM_ENDPOINT || 'http://localhost:8080/api/llm',
  
  // API Key for zkVM service
  apiKey: import.meta.env.VITE_ZKVM_API_KEY || 'dev-key-placeholder',
  
  // Default model configuration
  defaultModel: import.meta.env.VITE_ZKVM_MODEL || 'bitnet-b1.58-large',
  
  // Enable proof generation by default
  enableProofGeneration: import.meta.env.VITE_ZKVM_ENABLE_PROOF === 'true' || true,
  
  // Development mode settings
  developmentMode: import.meta.env.DEV || false,
  enableMockResponses: import.meta.env.VITE_ENABLE_MOCK_RESPONSES === 'true' || true,
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || false,
  
  // Model options
  availableModels: [
    {
      id: 'bitnet-b1.58-large',
      name: 'BitNet B1.58 Large',
      description: 'High-performance 1.58-bit quantized model',
      maxTokens: 4096,
      recommendedForWorkflow: true,
    },
    {
      id: 'bitnet-1b',
      name: 'BitNet 1B',
      description: 'Compact 1B parameter model',
      maxTokens: 2048,
      recommendedForWorkflow: false,
    },
    {
      id: 'bitnet-3b',
      name: 'BitNet 3B',
      description: 'Balanced 3B parameter model',
      maxTokens: 8192,
      recommendedForWorkflow: true,
    },
    {
      id: 'local-llm',
      name: 'Local LLM',
      description: 'Locally running LLM instance',
      maxTokens: 8192,
      recommendedForWorkflow: true,
    },
  ],
  
  // Performance settings
  timeoutMs: 30000,
  maxRetries: 3,
  retryDelayMs: 1000,
  
  // zkVM specific settings
  zkvm: {
    // Proof verification settings
    proofVerification: {
      enabled: true,
      timeout: 10000,
      maxRetries: 2,
    },
    
    // Compute resource limits
    computeLimits: {
      maxGasLimit: 1000000,
      maxExecutionTime: 30000,
      maxMemoryMB: 512,
    },
    
    // Circuit configuration
    circuit: {
      maxConstraints: 1000000,
      provingKey: 'default',
      verificationKey: 'default',
    },
  },
  
  // Feature flags
  features: {
    streaming: true,
    conversationHistory: true,
    proofExport: true,
    batchProcessing: false,
    customPrompts: true,
    workflowIntegration: true,
  },
  
  // UI Configuration
  ui: {
    maxMessagesDisplay: 100,
    typingIndicatorDelay: 500,
    autoScrollEnabled: true,
    soundEnabled: false,
    
    // Theme settings (matching SAP Protocol design)
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#f59e0b',
      successColor: '#22c55e',
      errorColor: '#ef4444',
      warningColor: '#f59e0b',
    },
  },
  
  // Preset system prompts
  systemPrompts: {
    default: `You are a helpful AI assistant integrated with SAP Protocol's sovereign agent system. 
You run on zkVM infrastructure, providing cryptographically verified responses. 
You can help with general questions, workflow design, agent configuration, and blockchain interactions.
Always maintain privacy and security while being helpful and informative.`,
    
    workflow: `You are a workflow design assistant for SAP Protocol. 
You help users create, optimize, and debug autonomous agent workflows.
Your responses are verified through zkVM proofs. Focus on practical workflow solutions,
node configuration, and best practices for autonomous agent systems.`,
    
    agent: `You are an agent configuration specialist for SAP Protocol.
You help users register, configure, and optimize their autonomous agents.
Your responses are cryptographically verified. Provide guidance on agent registration,
WorldID integration, reward systems, and security best practices.`,
    
    technical: `You are a technical support assistant for SAP Protocol's zkVM infrastructure.
You help with integration issues, API usage, proof verification, and system optimization.
Your responses are verified through zero-knowledge proofs. Focus on technical accuracy
and practical solutions for developers and system administrators.`,
  },
  
  // Error messages
  errorMessages: {
    connectionFailed: 'Failed to connect to zkVM endpoint. Please check your configuration.',
    apiKeyInvalid: 'Invalid API key. Please check your zkVM credentials.',
    modelNotFound: 'Requested model is not available. Please select a different model.',
    proofVerificationFailed: 'zkVM proof verification failed. Response authenticity cannot be guaranteed.',
    rateLimitExceeded: 'Rate limit exceeded. Please wait before making another request.',
    timeoutExceeded: 'Request timeout. The zkVM computation took too long.',
    insufficientGas: 'Insufficient gas for zkVM computation. Please increase gas limit.',
    circuitError: 'zkVM circuit error. Please check your input parameters.',
    unknownError: 'An unexpected error occurred. Please try again.',
  },
  
  // Development helpers
  development: {
    mockEndpoints: {
      chat: '/api/mock/chat',
      stream: '/api/mock/stream',
      verify: '/api/mock/verify',
      models: '/api/mock/models',
    },
    
    // Mock response templates
    mockResponses: {
      greeting: 'Hello! I\'m your zkVM-powered AI assistant. How can I help you today?',
      workflow: 'I can help you design and optimize workflows for your autonomous agents.',
      agent: 'I\'m here to assist with agent registration and configuration.',
      technical: 'I can help with technical issues and zkVM integration.',
    },
    
    // Simulated performance metrics
    simulatedMetrics: {
      minLatency: 500,
      maxLatency: 3000,
      avgLatency: 1500,
      proofGenTime: 800,
      gasUsageRange: [50000, 500000],
    },
  },
  
  // Local LLM configuration
  localLLM: {
    enabled: import.meta.env.VITE_LOCAL_LLM_ENABLED === 'true' || false,
    endpoint: import.meta.env.VITE_LOCAL_LLM_ENDPOINT || 'http://localhost:11434/api/generate',
    model: import.meta.env.VITE_LOCAL_LLM_MODEL || 'llama2',
    streamingEndpoint: import.meta.env.VITE_LOCAL_LLM_STREAMING_ENDPOINT || 'http://localhost:11434/api/generate',
    chatEndpoint: import.meta.env.VITE_LOCAL_LLM_CHAT_ENDPOINT || 'http://localhost:11434/api/chat',
    embeddingEndpoint: import.meta.env.VITE_LOCAL_LLM_EMBEDDING_ENDPOINT || 'http://localhost:11434/api/embeddings',
    apiKey: import.meta.env.VITE_LOCAL_LLM_API_KEY || '',
    
    // Ollama/Local LLM specific options
    options: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      repeat_penalty: 1.1,
      num_predict: 512,
      num_ctx: 2048,
      stream: true,
    },
    
    // Common local LLM models
    supportedModels: [
      { id: 'llama2', name: 'Llama 2', size: '7B' },
      { id: 'llama2:13b', name: 'Llama 2 13B', size: '13B' },
      { id: 'codellama', name: 'Code Llama', size: '7B' },
      { id: 'mistral', name: 'Mistral', size: '7B' },
      { id: 'neural-chat', name: 'Neural Chat', size: '7B' },
      { id: 'starling-lm', name: 'Starling LM', size: '7B' },
      { id: 'openchat', name: 'OpenChat', size: '7B' },
      { id: 'phi', name: 'Phi-2', size: '2.7B' },
    ],
  },
};

// Helper functions
export const getZkVMEndpoint = (): string => {
  return zkVMConfig.defaultEndpoint;
};

export const getApiKey = (): string | undefined => {
  return zkVMConfig.apiKey;
};

export const isProofEnabled = (): boolean => {
  return zkVMConfig.enableProofGeneration;
};

export const isDevelopmentMode = (): boolean => {
  return zkVMConfig.developmentMode;
};

export const isMockEnabled = (): boolean => {
  return zkVMConfig.enableMockResponses;
};

export const getTimeout = (): number => {
  return zkVMConfig.timeoutMs;
};

export const isLocalLLMEnabled = (): boolean => {
  return zkVMConfig.localLLM.enabled;
};

export const getLocalLLMEndpoint = (): string => {
  return zkVMConfig.localLLM.endpoint;
};

export const getLocalLLMModel = (): string => {
  return zkVMConfig.localLLM.model;
};

// Get model configuration
export const getModelConfig = (modelId: string) => {
  return zkVMConfig.availableModels.find(model => model.id === modelId);
};

// Get system prompt by type
export const getSystemPrompt = (type: keyof typeof zkVMConfig.systemPrompts = 'default') => {
  return zkVMConfig.systemPrompts[type];
};

// Validate configuration
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!zkVMConfig.defaultEndpoint) {
    errors.push('zkVM endpoint is required');
  }
  
  if (!zkVMConfig.apiKey && !zkVMConfig.developmentMode) {
    errors.push('API key is required for production mode');
  }
  
  if (!zkVMConfig.defaultModel) {
    errors.push('Default model must be specified');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export default configuration
export default zkVMConfig; 