"use client";

import { useState } from "react";

/**
 * Chat Main Interface Mockup
 *
 * Design Decisions:
 * - Chat is the primary experience with a collapsible sidebar for files
 * - Sidebar collapses to icons on mobile/when space is needed
 * - Messages show clear distinction between user and AI responses
 * - AI responses include clickable citations that reference source documents
 * - Input area is pinned to bottom with file upload button integrated
 *
 * Trade-offs:
 * - Chose a left sidebar over a right one for natural reading flow
 * - Citations are inline badges rather than footnotes for immediacy
 * - Kept sidebar simple (recent files only) vs full folder tree to reduce complexity
 */

// Mock data for demonstration
const mockMessages = [
  {
    id: "1",
    role: "user" as const,
    content: "What are the key findings from the Q3 financial report?",
  },
  {
    id: "2",
    role: "assistant" as const,
    content: "Based on the Q3 Financial Report, here are the key findings:\n\n1. **Revenue Growth**: Total revenue increased by 23% year-over-year, reaching $4.2M.\n\n2. **Operating Costs**: Operating expenses were reduced by 8% through process automation initiatives.\n\n3. **Customer Acquisition**: The company added 1,247 new enterprise customers, a 45% increase from Q2.",
    citations: [
      { id: "c1", filename: "Q3-Financial-Report.pdf", page: 3 },
      { id: "c2", filename: "Q3-Financial-Report.pdf", page: 7 },
    ],
  },
  {
    id: "3",
    role: "user" as const,
    content: "How does this compare to our competitors mentioned in the market analysis?",
  },
  {
    id: "4",
    role: "assistant" as const,
    content: "According to the Market Analysis document, your performance compares favorably:\n\n- **Revenue Growth**: Your 23% growth outpaces the industry average of 15% and competitor average of 18%.\n\n- **Cost Efficiency**: Your 8% cost reduction is notable as competitors averaged only 3% reductions.\n\n- **Market Share**: You've gained approximately 2.3% market share in Q3, moving from 12.1% to 14.4%.",
    citations: [
      { id: "c3", filename: "Market-Analysis-2024.pdf", page: 12 },
      { id: "c4", filename: "Market-Analysis-2024.pdf", page: 15 },
      { id: "c5", filename: "Q3-Financial-Report.pdf", page: 8 },
    ],
  },
];

const mockRecentFiles = [
  { id: "f1", name: "Q3-Financial-Report.pdf", type: "pdf" },
  { id: "f2", name: "Market-Analysis-2024.pdf", type: "pdf" },
  { id: "f3", name: "Product-Roadmap.docx", type: "doc" },
  { id: "f4", name: "Customer-Feedback.txt", type: "txt" },
  { id: "f5", name: "Team-Notes.pdf", type: "pdf" },
];

// Simple icons as SVG components (no external library needed)
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export default function ChatMainMockup() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-14"
        } flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all duration-200 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          {sidebarOpen && (
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Manila
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="w-4 h-4" />
            ) : (
              <MenuIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* View Toggle */}
        <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveView("chat")}
              className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                activeView === "chat"
                  ? "bg-[#6c47ff]/10 text-[#6c47ff]"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <ChatIcon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Chat</span>}
            </button>
            <button
              onClick={() => setActiveView("files")}
              className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                activeView === "files"
                  ? "bg-[#6c47ff]/10 text-[#6c47ff]"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <FolderIcon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Files</span>}
            </button>
          </div>
        </div>

        {/* Recent Files (when sidebar is open) */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Recent Files
            </h3>
            <div className="space-y-1">
              {mockRecentFiles.map((file) => (
                <button
                  key={file.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <FileIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 flex-shrink-0" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed state - just show file icons */}
        {!sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {mockRecentFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  className="w-full flex items-center justify-center p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  title={file.name}
                >
                  <FileIcon className="w-4 h-4 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Document Chat
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Ask questions about your uploaded documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {mockRecentFiles.length} files indexed
            </span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {mockMessages.map((message) => (
            <div key={message.id} className="flex gap-4">
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium ${
                  message.role === "user"
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    : "bg-[#6c47ff] text-white"
                }`}
              >
                {message.role === "user" ? "U" : "M"}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {message.role === "user" ? "You" : "Manila"}
                  </span>
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* Citations */}
                {message.role === "assistant" && message.citations && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <button
                        key={citation.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <FileIcon className="w-3 h-3" />
                        <span>{citation.filename}</span>
                        <span className="text-zinc-400 dark:text-zinc-500">
                          p.{citation.page}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-end gap-3">
            {/* File Upload Button */}
            <button
              className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title="Attach files"
            >
              <PaperclipIcon className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about your documents..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50 focus:border-[#6c47ff]"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <button
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-[#6c47ff] text-white hover:bg-[#5a3ad6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputValue.trim()}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 text-center">
            Manila can make mistakes. Verify important information in your source documents.
          </p>
        </div>
      </div>
    </div>
  );
}
