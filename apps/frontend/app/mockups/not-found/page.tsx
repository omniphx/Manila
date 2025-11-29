"use client";

/**
 * 404 Not Found Page Mockup
 *
 * Design Decisions:
 * - Large, friendly "404" display with subtle animation consideration
 * - Warm, conversational messaging that matches Manila's chat-first brand
 * - Single primary action (go home) with secondary option (back to chat)
 * - Subtle purple accent to maintain brand identity without being alarming
 * - Minimal elements - only what's needed to help the user navigate
 *
 * Trade-offs:
 * - Chose text-based "404" over illustration for simplicity and fast load
 * - Single CTA approach vs multiple options to reduce decision paralysis
 * - No search functionality - keep it simple, just redirect to working pages
 */

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

export default function NotFoundMockup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8">
      {/* Large 404 Display */}
      <div className="relative mb-8">
        {/* Background accent glow */}
        <div className="absolute inset-0 blur-3xl opacity-20 bg-[#6c47ff] rounded-full scale-150" />

        {/* 404 Number */}
        <h1 className="relative text-[10rem] md:text-[14rem] font-bold leading-none text-zinc-100 dark:text-zinc-900 select-none">
          404
        </h1>

        {/* Overlay accent text */}
        <h1 className="absolute inset-0 text-[10rem] md:text-[14rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#6c47ff] to-[#6c47ff]/50 select-none">
          404
        </h1>
      </div>

      {/* Friendly Message */}
      <div className="text-center max-w-md mb-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Page not found
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Primary: Go Home */}
        <button className="flex items-center gap-2 px-6 py-3 bg-[#6c47ff] text-white rounded-full font-medium hover:bg-[#5a3ad6] transition-colors">
          <HomeIcon className="w-5 h-5" />
          Go to Homepage
        </button>

        {/* Secondary: Back to Chat */}
        <button className="flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
          <ChatIcon className="w-5 h-5" />
          Back to Chat
        </button>
      </div>

      {/* Subtle back link */}
      <button className="mt-8 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-[#6c47ff] transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Go back to previous page
      </button>
    </div>
  );
}
