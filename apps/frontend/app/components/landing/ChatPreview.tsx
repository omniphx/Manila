"use client";

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export function ChatPreview() {
  return (
    <div className="mb-24">
      <div className="w-full max-w-2xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              3 documents indexed
            </span>
          </div>
        </div>

        {/* Chat messages */}
        <div className="p-4 space-y-4">
          {/* User message */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 flex-shrink-0">
              U
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                What are the key points from the quarterly report?
              </p>
            </div>
          </div>

          {/* AI response */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#6c47ff] flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
              M
            </div>
            <div className="flex-1">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2">
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  Based on the Q3 Financial Report, the key highlights are:
                </p>
                <ul className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside space-y-1">
                  <li>Revenue grew 23% year-over-year</li>
                  <li>Operating costs reduced by 8%</li>
                  <li>Customer base expanded by 45%</li>
                </ul>
              </div>
              {/* Citation badge */}
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                  <DocumentIcon className="w-3 h-3" />
                  Q3-Report.pdf, p.3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Input area (static) */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              Ask a question about your documents...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
