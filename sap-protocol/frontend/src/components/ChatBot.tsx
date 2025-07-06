import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Settings, 
  MessageSquare, 
  Zap,
  Brain,
  Workflow,
  Code,
  Copy,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useLLM } from '../hooks/useLLM';
import type { ChatMessage } from '../config/contracts';

export function ChatBot() {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages, 
    currentSession,
    createNewSession 
  } = useLLM();

  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState<'default' | 'agent' | 'workflow' | 'technical'>('default');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue;
    setInputValue('');
    
    try {
      await sendMessage(messageContent, selectedMode);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const modes = [
    { 
      id: 'default', 
      label: 'General', 
      icon: <MessageSquare className="w-4 h-4" />, 
      color: 'from-blue-500 to-cyan-500',
      description: 'General questions about SAP Protocol'
    },
    { 
      id: 'agent', 
      label: 'Agent', 
      icon: <Bot className="w-4 h-4" />, 
      color: 'from-purple-500 to-pink-500',
      description: 'Agent registration and management'
    },
    { 
      id: 'workflow', 
      label: 'Workflow', 
      icon: <Workflow className="w-4 h-4" />, 
      color: 'from-green-500 to-emerald-500',
      description: 'Workflow design and automation'
    },
    { 
      id: 'technical', 
      label: 'Technical', 
      icon: <Code className="w-4 h-4" />, 
      color: 'from-orange-500 to-red-500',
      description: 'Development and technical support'
    },
  ];

  const quickPrompts = [
    "How do I register a new agent?",
    "Explain workflow nodes and connections",
    "What is zkVM and how does it work?",
    "Show me the smart contract architecture",
    "How to submit and track tasks?",
    "Best practices for agent development",
  ];

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto h-full">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-600">Powered by advanced language models</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mode Selector */}
              <div className="flex items-center space-x-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedMode === mode.id
                        ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={mode.description}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={clearMessages}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to SAP Protocol AI Assistant
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Ask me anything about agent registration, workflow design, or technical implementation.
                  </p>
                  
                  {/* Quick Prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(prompt)}
                        className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-3xl p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessage(message.content) 
                        }}
                      />
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-50 text-gray-900 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {error && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-100">
                <div className="flex items-center space-x-2 text-red-700">
                  <span className="text-sm">⚠️ {error}</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask about ${modes.find(m => m.id === selectedMode)?.label.toLowerCase()} or anything else...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Session Info */}
            {currentSession && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium capitalize">{selectedMode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Messages:</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">{currentSession.createdAt.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistant Modes</h3>
              <div className="space-y-3">
                {modes.map((mode) => (
                  <div 
                    key={mode.id}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedMode === mode.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${mode.color} rounded-lg flex items-center justify-center text-white`}>
                        {mode.icon}
                      </div>
                      <h4 className="font-medium text-gray-900">{mode.label}</h4>
                    </div>
                    <p className="text-xs text-gray-600">{mode.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Use specific modes for better responses</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Click quick prompts to get started</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Copy AI responses with the copy button</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 