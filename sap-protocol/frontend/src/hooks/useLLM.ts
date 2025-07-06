import { useState, useCallback } from 'react';
import type { ChatMessage, ChatSession } from '../config/contracts';
import { getLLMConfig, getSystemPrompt } from '../config/contracts';

interface UseLLMReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, sessionType?: 'default' | 'agent' | 'workflow' | 'technical') => Promise<void>;
  clearMessages: () => void;
  currentSession: ChatSession | null;
  createNewSession: (title?: string, type?: 'default' | 'agent' | 'workflow' | 'technical') => void;
}

export function useLLM(): UseLLMReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createNewSession = useCallback((title?: string, type: 'default' | 'agent' | 'workflow' | 'technical' = 'default') => {
    const sessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: sessionId,
      title: title || 'New Chat Session',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'openai',
      systemPrompt: getSystemPrompt(type)
    };
    
    setCurrentSession(newSession);
    setMessages([]);
    setError(null);
  }, []);

  const callOpenAI = async (messages: ChatMessage[], config: any): Promise<string> => {
    if (!config.apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.');
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  };

  const callAnthropicClaude = async (messages: ChatMessage[], config: any): Promise<string> => {
    if (!config.apiKey) {
      throw new Error('Anthropic API key not configured. Please set VITE_ANTHROPIC_API_KEY environment variable.');
    }

    // Claude API format is different - it requires system prompt separately
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${config.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        system: systemPrompt,
        messages: conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  };

  const callLocalLLM = async (messages: ChatMessage[], config: any): Promise<string> => {
    // Mock implementation for local LLM - you can replace with actual local API call
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      // Fallback to mock response if local LLM is not available
      return `This is a mock response from local LLM (${config.model}). Your message: "${messages[messages.length - 1]?.content}"`;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  };

  const sendMessage = useCallback(async (
    content: string, 
    sessionType: 'default' | 'agent' | 'workflow' | 'technical' = 'default'
  ) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create session if not exists
      if (!currentSession) {
        createNewSession(`Chat - ${new Date().toLocaleTimeString()}`, sessionType);
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Prepare messages for API call (include system prompt)
      const systemMessage: ChatMessage = {
        id: 'system',
        role: 'system',
        content: getSystemPrompt(sessionType),
        timestamp: new Date(),
      };

      const apiMessages = [systemMessage, ...updatedMessages];

      // Get LLM configuration
      const config = getLLMConfig('openai'); // Default to OpenAI for now
      
      let responseContent: string;
      
      try {
        // Try OpenAI first
        responseContent = await callOpenAI(apiMessages, config);
      } catch (openaiError) {
        console.warn('OpenAI failed, trying local LLM:', openaiError);
        try {
          // Fallback to local LLM
          const localConfig = getLLMConfig('local');
          responseContent = await callLocalLLM(apiMessages, localConfig);
        } catch (localError) {
          console.warn('Local LLM failed, using mock response:', localError);
          responseContent = `I'm a mock AI assistant for SAP Protocol. I can help you with:

• **Agent Registration**: Guide you through registering your zkVM-powered agents
• **Workflow Design**: Help create efficient automation workflows  
• **Task Management**: Explain how to submit and track tasks
• **Technical Support**: Answer questions about smart contracts and development

Your message: "${content}"

Please note: This is a demo response. Configure your LLM API keys to get real AI responses.`;
        }
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        provider: 'openai',
        model: config.model,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('LLM API Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSession, createNewSession]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentSession(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    currentSession,
    createNewSession,
  };
} 