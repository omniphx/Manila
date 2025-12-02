"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { DragDropOverlay } from "../components/DragDropOverlay";
import { UploadProgress, type UploadFile } from "../components/UploadProgress";
import { ProcessingStatus, type ProcessingFile } from "../components/ProcessingStatus";
import { uploadFile } from "../actions/upload";
import { trpc } from "@/lib/trpc";

const mockRecentFiles = [
  { id: "f1", name: "Q3-Financial-Report.pdf", type: "pdf" },
  { id: "f2", name: "Market-Analysis-2024.pdf", type: "pdf" },
  { id: "f3", name: "Product-Roadmap.docx", type: "doc" },
  { id: "f4", name: "Customer-Feedback.txt", type: "txt" },
  { id: "f5", name: "Team-Notes.pdf", type: "pdf" },
];

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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// Helper to get user initials from name
function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

// Helper to format time
function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
        M
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Manila</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">thinking...</span>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const userName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitials = getInitials(user?.firstName, user?.lastName);
  const userImageUrl = user?.imageUrl;

  // Create or get existing conversation
  const { data: conversations = [], isLoading: loadingConversations } = trpc.chat.getConversations.useQuery();
  const createConversation = trpc.chat.createConversation.useMutation();
  const { data: messages = [], refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );
  const sendMessage = trpc.chat.sendMessage.useMutation();

  // Initialize conversation on mount - load most recent or create new
  useEffect(() => {
    if (!conversationId && !loadingConversations) {
      if (conversations.length > 0) {
        // Load the most recent conversation
        setConversationId(conversations[0].id);
      } else if (!createConversation.isPending) {
        // Create new conversation if none exist and not already creating
        createConversation.mutate(
          { title: "New Conversation" },
          {
            onSuccess: (data) => {
              setConversationId(data.id);
            },
          }
        );
      }
    }
  }, [conversationId, loadingConversations]);
  // Only depend on conversationId and loadingConversations
  // conversations.length is accessed but not a dependency to avoid infinite loop

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content,
      });

      // Refetch messages to get the new user message and AI response
      await refetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(errorMessage);
      // Restore the message in case of error
      setInputValue(content);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFilesDropped = async (files: File[]) => {
    if (files.length === 0) return;

    // Create initial upload file entries
    const newUploadFiles: UploadFile[] = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadFiles]);

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadFileEntry = newUploadFiles[i];

      try {
        // Simulate progress updates (since server action doesn't support progress)
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFileEntry.id && f.status === "uploading"
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 200);

        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadFile(formData);

        clearInterval(progressInterval);

        if (result.success) {
          // Mark upload as complete
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFileEntry.id
                ? { ...f, progress: 100, status: "completed" }
                : f
            )
          );

          // Add to processing queue
          const processingId = `process-${Date.now()}-${i}`;
          setProcessingFiles((prev) => [
            ...prev,
            {
              id: processingId,
              name: file.name,
              status: "processing",
              progress: "Analyzing document structure...",
            },
          ]);

          // Simulate processing with status updates
          setTimeout(() => {
            setProcessingFiles((prev) =>
              prev.map((f) =>
                f.id === processingId
                  ? { ...f, progress: "Extracting text content..." }
                  : f
              )
            );
          }, 1000);

          setTimeout(() => {
            setProcessingFiles((prev) =>
              prev.map((f) =>
                f.id === processingId
                  ? { ...f, progress: "Generating embeddings..." }
                  : f
              )
            );
          }, 2000);

          // Complete processing
          setTimeout(() => {
            setProcessingFiles((prev) =>
              prev.map((f) =>
                f.id === processingId
                  ? {
                      ...f,
                      status: "completed",
                      pages: Math.floor(Math.random() * 50) + 1,
                    }
                  : f
              )
            );
          }, 3000);

          // Clear completed processing after 5 seconds
          setTimeout(() => {
            setProcessingFiles((prev) =>
              prev.filter((f) => f.id !== processingId || f.status !== "completed")
            );
          }, 8000);
        } else {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFileEntry.id
                ? { ...f, status: "error", error: result.error }
                : f
            )
          );
        }
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFileEntry.id
              ? { ...f, status: "error", error: "Upload failed" }
              : f
          )
        );
      }
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((f) => f.status !== "completed"));
    }, 3000);
  };

  const handleCancelUpload = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <DragDropOverlay onFilesDropped={handleFilesDropped} className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
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

        {/* New Chat Button */}
        <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => {
              createConversation.mutate(
                { title: "New Conversation" },
                {
                  onSuccess: (data) => {
                    setConversationId(data.id);
                  },
                }
              );
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors bg-[#6c47ff] text-white hover:bg-[#5a3ad6]"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">New Chat</span>}
          </button>
        </div>

        {/* View Toggle */}
        <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <button
              className="flex items-center gap-2 px-2 py-2 rounded-md transition-colors bg-[#6c47ff]/10 text-[#6c47ff]"
            >
              <ChatIcon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Chat</span>}
            </button>
            <Link
              href="/files"
              className="flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <FolderIcon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Files</span>}
            </Link>
          </div>
        </div>

        {/* Recent Conversations (when sidebar is open) */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Recent Conversations
            </h3>
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setConversationId(conv.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors group ${
                    conv.id === conversationId ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                  }`}
                >
                  <ChatIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 flex-shrink-0" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {conv.title || 'New Conversation'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed state - just show chat icons */}
        {!sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setConversationId(conv.id)}
                  className={`w-full flex items-center justify-center p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${
                    conv.id === conversationId ? 'bg-zinc-200 dark:bg-zinc-800' : ''
                  }`}
                  title={conv.title || 'New Conversation'}
                >
                  <ChatIcon className="w-4 h-4 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Badge */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
          <Link
            href="/account"
            className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${sidebarOpen ? '' : 'justify-center'}`}
          >
            {/* Avatar */}
            {userImageUrl ? (
              <img
                src={userImageUrl}
                alt={userName}
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {userInitials}
              </div>
            )}
            {sidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {userName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {userEmail}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <SettingsIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            )}
          </Link>
        </div>
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
          {messages.map((message) => {
            const metadata = message.metadata ? JSON.parse(message.metadata) : null;
            const citations = metadata?.citations || [];

            return (
              <div key={message.id} className="flex gap-4">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium ${
                    message.role === "user"
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      : "bg-[#6c47ff] text-white"
                  }`}
                >
                  {message.role === "user" ? userInitials : "M"}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {message.role === "user" ? "You" : "Manila"}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* Citations */}
                  {message.role === "assistant" && citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {citations.map((citation: any, index: number) => (
                        <button
                          key={index}
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
            );
          })}

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <UploadProgress files={uploadingFiles} onCancel={handleCancelUpload} />
          )}

          {/* Processing Status */}
          {processingFiles.length > 0 && (
            <ProcessingStatus files={processingFiles} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            {/* File Upload Button */}
            <button
              className="h-12 w-12 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
              title="Attach files"
            >
              <PaperclipIcon className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50 focus:border-[#6c47ff]"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSendMessage}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-[#6c47ff] text-white hover:bg-[#5a3ad6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputValue.trim() || !conversationId || isTyping}
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
    </DragDropOverlay>
  );
}
