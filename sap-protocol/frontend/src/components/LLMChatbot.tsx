import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Zap, 
  Settings, 
  Trash2, 
  Copy, 
  RefreshCw,
  ShieldCheck,
  Clock,
  Loader2,
  MessageCircle,
  PlusCircle
} from 'lucide-react';
import { llmApi, type LLMMessage, type LLMConfig } from '../services/llmApi';

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messageCount: number;
}

export function LLMChatbot() {
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<LLMConfig>(llmApi.getConfig());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default',
      title: 'New Chat',
      lastMessage: 'Welcome to SAP Protocol zkVM Chat',
      timestamp: new Date(),
      messageCount: 0
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('default');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const result = await llmApi.validateEndpoint();
    setConnectionStatus(result.isConnected ? 'connected' : 'disconnected');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage: LLMMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Use streaming for real-time response
      const streamGenerator = llmApi.streamMessage(userMessage.content, activeSessionId);
      let fullContent = '';

      for await (const chunk of streamGenerator) {
        if (chunk.finished) {
          // Create final assistant message
          const assistantMessage: LLMMessage = {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: fullContent,
            timestamp: new Date(),
            status: 'sent',
            zkProof: chunk.proof
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessage('');
          setIsStreaming(false);

          // Update session
          updateSession(activeSessionId, fullContent);
          break;
        } else {
          fullContent += chunk.content;
          setStreamingMessage(fullContent);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: LLMMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage('');
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = (sessionId: string, lastMessage: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            lastMessage: lastMessage.slice(0, 50) + '...',
            timestamp: new Date(),
            messageCount: session.messageCount + 2
          }
        : session
    ));
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `Chat ${sessions.length}`,
      lastMessage: 'New conversation started',
      timestamp: new Date(),
      messageCount: 0
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setMessages([]);
    llmApi.clearHistory();
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    // In a real implementation, you'd load messages for this session
    const sessionMessages = llmApi.getConversation(sessionId);
    setMessages(sessionMessages);
  };

  const clearChat = () => {
    setMessages([]);
    llmApi.clearHistory();
    setStreamingMessage('');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const updateConfig = (newConfig: Partial<LLMConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    llmApi.updateConfig(updatedConfig);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Sidebar - Chat Sessions */}
      <div className="w-80 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-blue-200/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">zkVM Chat</h2>
                <p className="text-sm text-gray-600">BitNet LLM</p>
              </div>
            </div>
            <button
              onClick={createNewSession}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="New Chat"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-gray-600">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'checking' ? 'Checking...' : 'Disconnected'}
            </span>
            <button
              onClick={checkConnection}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeSessionId === session.id
                    ? 'bg-blue-200/60 shadow-md border border-blue-300/50'
                    : 'hover:bg-blue-100/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{session.title}</h3>
                    <p className="text-sm text-gray-600 truncate mt-1">{session.lastMessage}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <MessageCircle className="w-3 h-3" />
                      <span>{session.messageCount}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{session.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-200/50">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex-1 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={clearChat}
              className="p-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">SAP Protocol zkVM Assistant</h3>
              <p className="text-sm text-blue-100">Powered by BitNet • Zero-Knowledge Verified</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm bg-white/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>zkVM Secured</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingMessage && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to zkVM Chat</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start a conversation with our BitNet LLM running on zero-knowledge virtual machine. 
                All computations are cryptographically verified.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Explain zkVM technology",
                  "How does BitNet work?",
                  "SAP Protocol features",
                  "Zero-knowledge proofs"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-green-500 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600'
              }`}>
                {message.role === 'user' ? 
                  <User className="w-5 h-5 text-white" /> : 
                  <Bot className="w-5 h-5 text-white" />
                }
              </div>
              
              <div className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* zkVM Proof Indicator */}
                  {message.zkProof && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center space-x-2 text-sm opacity-80">
                      <Zap className="w-3 h-3" />
                      <span>zkVM Verified</span>
                    </div>
                  )}
                </div>
                
                {/* Message Actions */}
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {message.status === 'error' && (
                    <span className="text-red-500 text-xs">Failed</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {streamingMessage && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                <Bot className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 max-w-[80%]">
                <div className="inline-block p-4 rounded-2xl bg-gray-100 text-gray-900">
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-600">Generating...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200/50 bg-white/60 backdrop-blur-sm p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about zkVM, BitNet, or SAP Protocol..."
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={isLoading || isStreaming}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                  {inputValue.length}/2000
                </div>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || isStreaming || connectionStatus !== 'connected'}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Status Info */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Model: {config.model}</span>
              <span>Temp: {config.temperature}</span>
              <span>Max: {config.maxTokens} tokens</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Zero-Knowledge Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chat Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => updateConfig({ model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bitnet-b1.58-large">BitNet B1.58 Large</option>
                  <option value="bitnet-b1.58-base">BitNet B1.58 Base</option>
                  <option value="bitnet-1b">BitNet 1B</option>
                  <option value="bitnet-3b">BitNet 3B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {config.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={config.maxTokens}
                  onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  zkVM Endpoint
                </label>
                <input
                  type="url"
                  value={config.zkVMEndpoint}
                  onChange={(e) => updateConfig({ zkVMEndpoint: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableProof"
                  checked={config.enableProofGeneration}
                  onChange={(e) => updateConfig({ enableProofGeneration: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enableProof" className="ml-2 text-sm text-gray-700">
                  Enable Proof Generation
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  checkConnection();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 