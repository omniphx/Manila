"use client";

import { useState } from "react";

/**
 * Error Page Mockup (500 / General Error)
 *
 * Design Decisions:
 * - Calming, reassuring messaging instead of alarming error text
 * - Subtle error icon that doesn't create panic
 * - Clear primary action (try again) with fallback options
 * - Collapsible technical details for developers
 * - Support/help link for users who need assistance
 *
 * Trade-offs:
 * - Shows technical details collapsed by default - visible for devs, not scary for users
 * - Chose "try again" as primary action vs "go home" since most errors are transient
 * - Simple layout over elaborate illustrations to load fast even when things break
 */

function ExclamationCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

// Mock error data for demonstration
const mockError = {
  message: "Failed to fetch document embeddings",
  code: "ERR_FETCH_EMBEDDINGS",
  timestamp: new Date().toISOString(),
  requestId: "req_abc123xyz789",
  stack: `Error: Failed to fetch document embeddings
    at EmbeddingsService.fetch (/app/services/embeddings.ts:42:11)
    at async DocumentProcessor.process (/app/services/processor.ts:87:23)
    at async APIHandler.handle (/app/api/documents.ts:156:5)`,
};

export default function ErrorPageMockup() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8">
      {/* Error Icon */}
      <div className="mb-6 p-4 rounded-full bg-amber-50 dark:bg-amber-900/20">
        <ExclamationCircleIcon className="w-12 h-12 text-amber-500 dark:text-amber-400" />
      </div>

      {/* Main Message */}
      <div className="text-center max-w-md mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Something went wrong
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We ran into an unexpected issue. This is usually temporary.
          Try refreshing the page or come back in a moment.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        {/* Primary: Try Again */}
        <button className="flex items-center gap-2 px-6 py-3 bg-[#6c47ff] text-white rounded-full font-medium hover:bg-[#5a3ad6] transition-colors">
          <ArrowPathIcon className="w-5 h-5" />
          Try Again
        </button>

        {/* Secondary: Go Home */}
        <button className="flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
          <HomeIcon className="w-5 h-5" />
          Go to Homepage
        </button>
      </div>

      {/* Technical Details (Collapsible) */}
      <div className="w-full max-w-lg">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mx-auto"
        >
          {showDetails ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
          {showDetails ? "Hide" : "Show"} technical details
        </button>

        {showDetails && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Error Code:</span>
                <code className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                  {mockError.code}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Request ID:</span>
                <code className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                  {mockError.requestId}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Timestamp:</span>
                <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                  {new Date(mockError.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400 block mb-2">Message:</span>
                <p className="text-zinc-700 dark:text-zinc-300">{mockError.message}</p>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400 block mb-2">Stack trace:</span>
                <pre className="p-2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {mockError.stack}
                </pre>
              </div>
            </div>

            {/* Copy Error Info Button */}
            <button className="mt-4 w-full py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#6c47ff] transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-[#6c47ff]">
              Copy error details to clipboard
            </button>
          </div>
        )}
      </div>

      {/* Support Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          Still having trouble?
        </p>
        <button className="inline-flex items-center gap-2 text-sm text-[#6c47ff] hover:text-[#5a3ad6] font-medium transition-colors">
          <EnvelopeIcon className="w-4 h-4" />
          Contact Support
        </button>
      </div>
    </div>
  );
}
