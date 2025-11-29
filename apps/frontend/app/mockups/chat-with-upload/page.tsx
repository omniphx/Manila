"use client";

import { useState } from "react";

/**
 * Chat with Upload Flow Mockup
 *
 * Design Decisions:
 * - Full-screen drag overlay appears when files are dragged over the window
 * - Upload progress shows inline in the chat as a special message type
 * - Processing status is shown with a subtle animation to indicate work in progress
 * - Once processed, the file becomes a clickable reference in the conversation
 * - Multiple files can be uploaded simultaneously with individual progress
 *
 * Trade-offs:
 * - Chose inline upload messages over a separate upload panel for conversation flow
 * - Simple progress bar vs detailed byte-by-byte progress for simplicity
 * - Processing animation is CSS-only to avoid JavaScript complexity
 */

// Mock conversation with upload states
const mockConversation = [
  {
    id: "1",
    type: "user" as const,
    content: "I have some documents I need to analyze. Let me upload them.",
  },
  {
    id: "2",
    type: "upload" as const,
    files: [
      {
        id: "u1",
        name: "Annual-Report-2024.pdf",
        size: 4250000,
        progress: 100,
        status: "completed" as const,
      },
    ],
  },
  {
    id: "3",
    type: "processing" as const,
    files: [
      {
        id: "u1",
        name: "Annual-Report-2024.pdf",
        status: "completed" as const,
        pages: 47,
      },
    ],
  },
  {
    id: "4",
    type: "assistant" as const,
    content:
      "I've processed your Annual Report 2024. It contains 47 pages covering financial performance, strategic initiatives, and market outlook. What would you like to know about it?",
  },
  {
    id: "5",
    type: "user" as const,
    content: "Let me add a few more documents for context.",
  },
  {
    id: "6",
    type: "upload" as const,
    files: [
      {
        id: "u2",
        name: "Q4-Financial-Summary.xlsx",
        size: 890000,
        progress: 100,
        status: "completed" as const,
      },
      {
        id: "u3",
        name: "Board-Presentation.pptx",
        size: 12400000,
        progress: 65,
        status: "uploading" as const,
      },
    ],
  },
];

// Icons
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function DocumentTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function ChatWithUploadMockup() {
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="relative flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#6c47ff]/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-[#6c47ff] rounded-lg">
          <div className="text-center">
            <CloudUploadIcon className="w-16 h-16 text-[#6c47ff] mx-auto mb-4" />
            <p className="text-lg font-semibold text-[#6c47ff]">Drop files here</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              PDF, DOCX, TXT, and more supported
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Document Chat
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Upload files by dragging them here or using the attach button
        </p>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
      >
        {mockConversation.map((item) => {
          // User message
          if (item.type === "user") {
            return (
              <div key={item.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                  U
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                    You
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {item.content}
                  </p>
                </div>
              </div>
            );
          }

          // Upload progress message
          if (item.type === "upload") {
            return (
              <div key={item.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                  U
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    Uploading files
                  </p>
                  <div className="space-y-3">
                    {item.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                      >
                        <FileIcon className="w-8 h-8 text-zinc-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {file.name}
                            </p>
                            {file.status === "completed" ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <button className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  file.status === "completed"
                                    ? "bg-green-500"
                                    : "bg-[#6c47ff]"
                                }`}
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                              {file.status === "completed"
                                ? formatFileSize(file.size)
                                : `${file.progress}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Processing status message
          if (item.type === "processing") {
            return (
              <div key={item.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    Manila
                  </p>
                  <div className="space-y-2">
                    {item.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#6c47ff]/5 border border-[#6c47ff]/20"
                      >
                        {file.status === "completed" ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <SpinnerIcon className="w-5 h-5 text-[#6c47ff] flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            {file.status === "completed" ? (
                              <>
                                <span className="font-medium">{file.name}</span>
                                <span className="text-zinc-500 dark:text-zinc-400">
                                  {" "}
                                  processed ({file.pages} pages indexed)
                                </span>
                              </>
                            ) : (
                              <>
                                Processing{" "}
                                <span className="font-medium">{file.name}</span>
                                ...
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Assistant message
          if (item.type === "assistant") {
            return (
              <div key={item.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                    Manila
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {item.content}
                  </p>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Live Processing Demo */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            M
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Manila
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#6c47ff]/5 border border-[#6c47ff]/20">
              <SpinnerIcon className="w-5 h-5 text-[#6c47ff] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  Processing <span className="font-medium">Q4-Financial-Summary.xlsx</span>...
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Extracting data from 12 sheets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending File Chips (before sending) */}
      <div className="px-6 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm">
            <DocumentTextIcon className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300">Meeting-Notes.pdf</span>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm">
            <DocumentTextIcon className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300">Strategy-Doc.docx</span>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          2 files ready to upload. Send a message or press Enter to upload.
        </p>
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
              placeholder="Ask about your documents or drop files to upload..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50 focus:border-[#6c47ff]"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-[#6c47ff] text-white hover:bg-[#5a3ad6] transition-colors"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button to Show/Hide Drag Overlay (for demo) */}
      <div className="absolute bottom-20 right-4">
        <button
          onClick={() => setIsDragging(!isDragging)}
          className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {isDragging ? "Hide" : "Show"} Drop Zone
        </button>
      </div>
    </div>
  );
}
