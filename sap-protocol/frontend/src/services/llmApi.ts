// LLM API Service for zkVM Integration
// This service handles communication with zkVM-based LLM endpoints

import { zkVMConfig, getZkVMEndpoint, getApiKey, isProofEnabled, isDevelopmentMode, isMockEnabled, isLocalLLMEnabled, getLocalLLMEndpoint, getLocalLLMModel } from '../config/zkvm';

export interface LLMMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  zkProof?: string; // zkVM proof of computation
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  zkVMEndpoint?: string;
  enableProofGeneration?: boolean;
}

export interface LLMResponse {
  message: LLMMessage;
  proof?: string;
  computationTime?: number;
  gasUsed?: number;
}

export interface StreamResponse {
  content: string;
  finished: boolean;
  proof?: string;
}

// Default zkVM LLM configuration
const DEFAULT_CONFIG: LLMConfig = {
  model: zkVMConfig.defaultModel,
  temperature: 0.7,
  maxTokens: 2000,
  zkVMEndpoint: getZkVMEndpoint(),
  enableProofGeneration: isProofEnabled(),
};

class LLMApiService {
  private config: LLMConfig;
  private messageHistory: LLMMessage[] = [];

  constructor(config?: Partial<LLMConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Send a message to the zkVM LLM
  async sendMessage(
    content: string,
    conversationId?: string,
    config?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    const requestConfig = { ...this.config, ...config };
    
    const userMessage: LLMMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    };

    this.messageHistory.push(userMessage);

    try {
      // Check if local LLM is enabled
      if (isLocalLLMEnabled()) {
        return await this.sendMessageToLocalLLM(content, userMessage, requestConfig);
      }

      // Check if we're in development mode with mock responses
      if (isDevelopmentMode() && isMockEnabled()) {
        return await this.getMockResponse(content, userMessage);
      }

      // Send to zkVM endpoint
      return await this.sendMessageToZkVM(content, userMessage, requestConfig);
    } catch (error) {
      // Update user message status
      const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
      if (userMsgIndex !== -1) {
        this.messageHistory[userMsgIndex].status = 'error';
      }

      const errorMessage: LLMMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: this.getErrorMessage(error),
        timestamp: new Date(),
        status: 'error',
      };

      this.messageHistory.push(errorMessage);

      return {
        message: errorMessage,
        computationTime: 0,
        gasUsed: 0,
      };
    }
  }

  // Streaming chat for real-time responses
  async *streamMessage(
    content: string,
    conversationId?: string,
    config?: Partial<LLMConfig>
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const requestConfig = { ...this.config, ...config };
    
    const userMessage: LLMMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    };

    this.messageHistory.push(userMessage);

    try {
      // Check if local LLM is enabled
      if (isLocalLLMEnabled()) {
        yield* this.streamMessageToLocalLLM(content, userMessage, requestConfig);
        return;
      }

      // Check if we're in development mode
      if (isDevelopmentMode() && isMockEnabled()) {
        yield* this.getMockStreamResponse(content);
        return;
      }

      // Stream from zkVM endpoint
      yield* this.streamMessageToZkVM(content, userMessage, requestConfig);
    } catch (error) {
      // Update user message status
      const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
      if (userMsgIndex !== -1) {
        this.messageHistory[userMsgIndex].status = 'error';
      }

      yield {
        content: this.getErrorMessage(error),
        finished: true,
      };
    }
  }

  // Get conversation history
  getHistory(): LLMMessage[] {
    return [...this.messageHistory];
  }

  // Clear conversation history
  clearHistory(): void {
    this.messageHistory = [];
  }

  // Get messages for a specific conversation
  getConversation(conversationId: string): LLMMessage[] {
    // In a real implementation, this would fetch from storage
    return this.messageHistory.filter(msg => msg.id.includes(conversationId));
  }

  // Update configuration
  updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  // Validate zkVM endpoint connection
  async validateEndpoint(): Promise<{ isConnected: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      if (isDevelopmentMode() && isMockEnabled()) {
        // Simulate connection check
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          isConnected: true,
          latency: Date.now() - startTime,
        };
      }

      const response = await fetch(`${this.config.zkVMEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      return {
        isConnected: response.ok,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate unique message ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Get user-friendly error message
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return zkVMConfig.errorMessages.connectionFailed;
      }
      if (error.message.includes('401')) {
        return zkVMConfig.errorMessages.apiKeyInvalid;
      }
      if (error.message.includes('404')) {
        return zkVMConfig.errorMessages.modelNotFound;
      }
      if (error.message.includes('timeout')) {
        return zkVMConfig.errorMessages.timeoutExceeded;
      }
      if (error.message.includes('429')) {
        return zkVMConfig.errorMessages.rateLimitExceeded;
      }
      return error.message;
    }
    return zkVMConfig.errorMessages.unknownError;
  }

  // Mock response for development
  private async getMockResponse(content: string, userMessage: LLMMessage): Promise<LLMResponse> {
    // Simulate API delay
    const delay = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate contextual response
    let responseContent = zkVMConfig.development.mockResponses.greeting;
    
    if (content.toLowerCase().includes('workflow')) {
      responseContent = zkVMConfig.development.mockResponses.workflow;
    } else if (content.toLowerCase().includes('agent')) {
      responseContent = zkVMConfig.development.mockResponses.agent;
    } else if (content.toLowerCase().includes('technical') || content.toLowerCase().includes('error')) {
      responseContent = zkVMConfig.development.mockResponses.technical;
    }

    responseContent += `\n\n*Regarding your question: "${content}"*\n\nI'm running in development mode with mock responses. In production, I would be powered by zkVM infrastructure with cryptographic proof verification. Is there anything specific about SAP Protocol or zkVM that you'd like to know more about?`;

    const assistantMessage: LLMMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      status: 'sent',
      zkProof: `dev_proof_${Date.now()}`,
    };

    // Update user message status
    const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
    if (userMsgIndex !== -1) {
      this.messageHistory[userMsgIndex].status = 'sent';
    }

    this.messageHistory.push(assistantMessage);

    return {
      message: assistantMessage,
      proof: assistantMessage.zkProof,
      computationTime: delay,
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
    };
  }

  // Mock streaming response for development
  private async *getMockStreamResponse(content: string): AsyncGenerator<StreamResponse, void, unknown> {
    let responseContent = zkVMConfig.development.mockResponses.greeting;
    
    if (content.toLowerCase().includes('workflow')) {
      responseContent = zkVMConfig.development.mockResponses.workflow;
    } else if (content.toLowerCase().includes('agent')) {
      responseContent = zkVMConfig.development.mockResponses.agent;
    } else if (content.toLowerCase().includes('technical') || content.toLowerCase().includes('error')) {
      responseContent = zkVMConfig.development.mockResponses.technical;
    }

    responseContent += `\n\nRegarding your question: "${content}"\n\nI'm running in development mode with mock responses. In production, I would be powered by zkVM infrastructure with cryptographic proof verification.`;

    const words = responseContent.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      
      yield {
        content: word,
        finished: false,
      };
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }

    // Final response with proof
    yield {
      content: '',
      finished: true,
      proof: `dev_proof_${Date.now()}`,
    };
  }

  // Send message to local LLM (Ollama, LM Studio, etc.)
  private async sendMessageToLocalLLM(
    content: string,
    userMessage: LLMMessage,
    config: LLMConfig
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const endpoint = getLocalLLMEndpoint();
    const model = getLocalLLMModel();

    // Prepare request payload for different local LLM formats
    const payload = this.prepareLocalLLMPayload(content, model, config);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getLocalLLMHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(zkVMConfig.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    const responseContent = this.extractLocalLLMResponse(responseData);

    const assistantMessage: LLMMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      status: 'sent',
      zkProof: `local_llm_${Date.now()}`, // Mock proof for local LLM
    };

    // Update user message status
    const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
    if (userMsgIndex !== -1) {
      this.messageHistory[userMsgIndex].status = 'sent';
    }

    this.messageHistory.push(assistantMessage);

    return {
      message: assistantMessage,
      proof: assistantMessage.zkProof,
      computationTime: Date.now() - startTime,
      gasUsed: 0, // No gas for local LLM
    };
  }

  // Stream message to local LLM
  private async *streamMessageToLocalLLM(
    content: string,
    userMessage: LLMMessage,
    config: LLMConfig
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const endpoint = getLocalLLMEndpoint();
    const model = getLocalLLMModel();

    // Prepare streaming payload
    const payload = this.prepareLocalLLMPayload(content, model, config, true);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getLocalLLMHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(zkVMConfig.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              const content = this.extractStreamingContent(data);
              
              if (content) {
                yield {
                  content,
                  finished: false,
                };
              }

              // Check if streaming is finished
              if (data.done || data.finished) {
                yield {
                  content: '',
                  finished: true,
                  proof: `local_llm_stream_${Date.now()}`,
                };
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Update user message status
    const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
    if (userMsgIndex !== -1) {
      this.messageHistory[userMsgIndex].status = 'sent';
    }
  }

  // Send message to zkVM endpoint
  private async sendMessageToZkVM(
    content: string,
    userMessage: LLMMessage,
    config: LLMConfig
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    const response = await fetch(`${config.zkVMEndpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        enable_proof: config.enableProofGeneration,
      }),
      signal: AbortSignal.timeout(zkVMConfig.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`zkVM API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    const assistantMessage: LLMMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: responseData.message || responseData.response,
      timestamp: new Date(),
      status: 'sent',
      zkProof: responseData.proof,
    };

    // Update user message status
    const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
    if (userMsgIndex !== -1) {
      this.messageHistory[userMsgIndex].status = 'sent';
    }

    this.messageHistory.push(assistantMessage);

    return {
      message: assistantMessage,
      proof: responseData.proof,
      computationTime: Date.now() - startTime,
      gasUsed: responseData.gas_used || 0,
    };
  }

  // Stream message to zkVM endpoint
  private async *streamMessageToZkVM(
    content: string,
    userMessage: LLMMessage,
    config: LLMConfig
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const response = await fetch(`${config.zkVMEndpoint}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        enable_proof: config.enableProofGeneration,
        stream: true,
      }),
      signal: AbortSignal.timeout(zkVMConfig.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`zkVM API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield {
                content: '',
                finished: true,
              };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              
              if (content) {
                yield {
                  content,
                  finished: false,
                };
              }

              // Check for proof in final chunk
              if (parsed.proof) {
                yield {
                  content: '',
                  finished: true,
                  proof: parsed.proof,
                };
                return;
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Update user message status
    const userMsgIndex = this.messageHistory.findIndex(m => m.id === userMessage.id);
    if (userMsgIndex !== -1) {
      this.messageHistory[userMsgIndex].status = 'sent';
    }
  }

  // Prepare payload for different local LLM formats
  private prepareLocalLLMPayload(
    content: string,
    model: string,
    config: LLMConfig,
    streaming = false
  ): any {
    const endpoint = getLocalLLMEndpoint();
    
    // Ollama format
    if (endpoint.includes('ollama') || endpoint.includes('11434')) {
      return {
        model,
        prompt: content,
        stream: streaming,
        options: {
          ...zkVMConfig.localLLM.options,
          temperature: config.temperature || zkVMConfig.localLLM.options.temperature,
          num_predict: config.maxTokens || zkVMConfig.localLLM.options.num_predict,
        },
      };
    }

    // LM Studio format
    if (endpoint.includes('lmstudio') || endpoint.includes('1234')) {
      return {
        model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 512,
        stream: streaming,
      };
    }

    // Generic OpenAI-compatible format
    return {
      model,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 512,
      stream: streaming,
    };
  }

  // Get headers for local LLM requests
  private getLocalLLMHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Add API key if available
    const apiKey = zkVMConfig.localLLM.apiKey;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    return headers;
  }

  // Extract response content from different local LLM formats
  private extractLocalLLMResponse(data: any): string {
    // Ollama format
    if (data.response) {
      return data.response;
    }

    // OpenAI-compatible format
    if (data.choices && data.choices[0]) {
      return data.choices[0].message?.content || data.choices[0].text || '';
    }

    // Direct content
    if (data.content) {
      return data.content;
    }

    // Fallback
    return data.message || data.text || JSON.stringify(data);
  }

  // Extract streaming content from different local LLM formats
  private extractStreamingContent(data: any): string {
    // Ollama format
    if (data.response) {
      return data.response;
    }

    // OpenAI-compatible format
    if (data.choices && data.choices[0]) {
      return data.choices[0].delta?.content || data.choices[0].text || '';
    }

    // Direct content
    if (data.content) {
      return data.content;
    }

    return '';
  }
}

// Create and export singleton instance
export const llmApi = new LLMApiService();

// Helper functions
export const createMessage = (
  role: LLMMessage['role'],
  content: string,
  zkProof?: string
): LLMMessage => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
  role,
  content,
  timestamp: new Date(),
  zkProof,
});

export const formatExecutionTime = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const formatGasUsed = (gas?: number): string => {
  if (!gas) return 'N/A';
  if (gas < 1000) return gas.toString();
  if (gas < 1000000) return `${(gas / 1000).toFixed(1)}K`;
  return `${(gas / 1000000).toFixed(1)}M`;
}; 
