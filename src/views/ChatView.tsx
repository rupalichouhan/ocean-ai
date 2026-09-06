import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BuddyMascot } from '../components/BuddyMascot';
import { GlassCard } from '../components/GlassCard';
import { ChatMessage, Conversation, UserProfile, AIProviderType, MascotState } from '../types';
import * as api from '../services/api';

interface ChatViewProps {
  user: UserProfile;
  activeConversation: Conversation | null;
  initialPrompt?: string;
  onConversationCreated?: (conv: Conversation) => void;
  onConversationUpdated?: (conv: Conversation) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  user,
  activeConversation,
  initialPrompt,
  onConversationCreated,
  onConversationUpdated
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(user.defaultProvider || 'gemini');
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mascotState, setMascotState] = useState<MascotState>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // Load conversation messages on conversationId change
  useEffect(() => {
    if (activeConversation?.id) {
      api.getConversationDetails(activeConversation.id)
        .then((res) => {
          setMessages(res.messages);
        })
        .catch(() => {
          setMessages([]);
        });
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // Handle initialPrompt if provided (e.g. from Dashboard click)
  useEffect(() => {
    if (initialPrompt && !isStreaming) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText, isStreaming]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isStreaming) return;

    setInput('');
    setError(null);
    setIsStreaming(true);
    setStreamedText('');
    setMascotState('thinking');

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      conversationId: activeConversation?.id || 'pending',
      userId: user.id,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    let accumulatedText = '';

    const cancel = api.streamChat({
      conversationId: activeConversation?.id,
      prompt,
      provider: selectedProvider,
      onStart: (data) => {
        setMascotState('streaming');
        if (!activeConversation && onConversationCreated) {
          api.getConversationDetails(data.conversationId).then((res) => {
            onConversationCreated(res.conversation);
          });
        }
      },
      onToken: (token) => {
        accumulatedText += token;
        setStreamedText(accumulatedText);
      },
      onEnd: (data) => {
        setIsStreaming(false);
        setMascotState('success');
        const assistantMsg: ChatMessage = {
          id: data.messageId,
          conversationId: activeConversation?.id || 'active',
          userId: user.id,
          role: 'assistant',
          content: accumulatedText,
          provider: data.provider as AIProviderType,
          model: data.model,
          latencyMs: data.latencyMs,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamedText('');
        setTimeout(() => setMascotState('idle'), 2500);

        if (activeConversation && onConversationUpdated) {
          api.getConversationDetails(activeConversation.id).then((res) => {
            onConversationUpdated(res.conversation);
          });
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        setMascotState('error');
        setError(err.message || 'Stream interrupted. Please retry.');
      }
    });

    cancelStreamRef.current = cancel;
  };

  const handleStopStream = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    if (streamedText) {
      const partialMsg: ChatMessage = {
        id: `msg_${Date.now()}_partial`,
        conversationId: activeConversation?.id || 'active',
        userId: user.id,
        role: 'assistant',
        content: streamedText,
        provider: selectedProvider,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, partialMsg]);
    }
    setIsStreaming(false);
    setStreamedText('');
    setMascotState('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRegenerateLast = () => {
    if (messages.length === 0 || isStreaming) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto text-slate-900">
      {/* Active Conversation Sub-header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-hidden">
          <BuddyMascot state={mascotState} size="sm" />
          <div className="truncate">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {activeConversation?.title || 'New Exploration'}
            </div>
            <div className="text-[11px] text-slate-500">
              {messages.length} messages • Adaptive {user.aiPreference} tone
            </div>
          </div>
        </div>

        {/* Provider Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative inline-block">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as AIProviderType)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer transition-all shadow-xs"
            >
              <option value="gemini">Google Gemini 3.7</option>
              <option value="openai">OpenAI GPT-4o</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 pb-6">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
            <BuddyMascot state="idle" size="lg" />
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-900">Buddy is Ready</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                What concept would you like to explore today? Send an inquiry or try one of the suggestions below.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
              {[
                'Explain how bioluminescence works in the deep sea',
                'Design a distributed real-time messaging architecture',
                'Help me organize my daily learning workflow',
                'Write an imaginative story about deep sea voyagers'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="p-3 text-left rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs text-slate-700 transition-all leading-snug shadow-xs"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <BuddyMascot state="idle" size="sm" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4.5 ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                  }`}
                >
                  {/* Message Content */}
                  <div className={`text-sm leading-relaxed max-w-none ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Message Metadata Footer (Assistant) */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="capitalize text-slate-600 font-medium">
                          {msg.provider || 'Gemini'}
                        </span>
                        {msg.latencyMs && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={11} />
                            {msg.latencyMs}ms
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {copiedId === msg.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live Streaming Chunk */}
            {isStreaming && (
              <div className="flex gap-3.5 justify-start animate-fade-in">
                <div className="flex-shrink-0 mt-1">
                  <BuddyMascot state="streaming" size="sm" />
                </div>
                <div className="max-w-[85%] rounded-2xl p-4.5 bg-white border border-slate-300 text-slate-800 shadow-xs">
                  <div className="text-sm leading-relaxed max-w-none text-slate-800">
                    <ReactMarkdown>{streamedText || '...'}</ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-ping" />
                    <span>Streaming from {selectedProvider.toUpperCase()}...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRegenerateLast}
            className="px-2.5 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Bottom Fixed Composer */}
      <div className="relative pt-2">
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm focus-within:border-slate-400 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to Buddy... (Enter to send, Shift+Enter for new line)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none px-1 py-1 max-h-36 overflow-y-auto"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 px-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Shift + Enter for new line</span>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium text-xs transition-all flex items-center gap-1.5"
                >
                  <Square size={13} />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!input.trim()}
                  onClick={() => handleSendMessage()}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

