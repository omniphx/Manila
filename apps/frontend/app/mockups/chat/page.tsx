"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Simple Chat Interface Mockup
 *
 * Design Decisions:
 * - Clean, focused chat interface without sidebar distractions
 * - Clear visual distinction between sent (user) and received (assistant) messages
 * - User messages aligned right with primary accent color
 * - Assistant messages aligned left with neutral background
 * - Input fixed at bottom with send button
 * - Auto-scroll to latest message
 * - Timestamps shown on each message
 *
 * Trade-offs:
 * - Simpler than chat-main to focus on core chat UX
 * - No file attachments (see chat-with-upload for that flow)
 * - No citations (see chat-main for document-aware responses)
 */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Initial mock messages for demonstration
const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm here to help you with any questions you might have. How can I assist you today?",
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: "2",
    role: "user",
    content: "Hi! I'm exploring the chat interface. Can you tell me what features are available?",
    timestamp: new Date(Date.now() - 60000 * 4),
  },
  {
    id: "3",
    role: "assistant",
    content: "Of course! This chat interface includes:\n\n- Real-time message sending\n- Message history with timestamps\n- Auto-scroll to new messages\n- Support for both light and dark modes\n- Keyboard shortcuts (Enter to send)\n\nFeel free to type a message below to try it out!",
    timestamp: new Date(Date.now() - 60000 * 3),
  },
];

// Mock responses for demonstration
const mockResponses = [
  "That's a great question! Let me help you with that.",
  "I understand what you're looking for. Here's what I can tell you...",
  "Thanks for sharing that with me. Based on what you've said, I'd suggest...",
  "Interesting point! Here's my perspective on that topic.",
  "I'm happy to help clarify that for you. The key thing to understand is...",
];

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ChatMockup() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate assistant response after a delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Chat
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Interactive chat interface mockup
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[70%] ${
                message.role === "user" ? "order-2" : "order-1"
              }`}
            >
              {/* Avatar and Name */}
              <div
                className={`flex items-center gap-2 mb-1 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#6c47ff] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                    M
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {message.role === "user" ? "You" : "Manila"}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatTime(message.timestamp)}
                </span>
                {message.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                    U
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-[#6c47ff] text-white rounded-tr-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] sm:max-w-[70%]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#6c47ff] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                  M
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Manila
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-zinc-100 dark:bg-zinc-800">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-end gap-3">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50 focus:border-[#6c47ff]"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-[#6c47ff] text-white hover:bg-[#5a3ad6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
