"use client";

/**
 * Landing Page Mockup - Unauthenticated/Logged-out View
 *
 * Design Decisions:
 * - Hero section with clear value proposition: "Dropbox meets ChatGPT"
 * - Prominent CTAs using the brand purple (#6c47ff) with rounded-full styling
 * - Visual preview of the chat interface to show what users can expect
 * - Feature grid highlighting key benefits with simple icons
 * - Clean, minimal layout that matches the existing app aesthetic
 * - Full dark mode support using existing Tailwind patterns
 *
 * Trade-offs:
 * - Used inline SVG icons instead of an icon library to stay within existing dependencies
 * - Static chat preview rather than animated to keep complexity low
 * - Single-page design rather than multi-section scroll for simplicity
 */

// Simple SVG icons (no external library required)
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

// Feature card component for consistency
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
      <div className="w-10 h-10 rounded-lg bg-[#6c47ff]/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Mock chat preview component
function ChatPreview() {
  return (
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
  );
}

export default function LandingPageMockup() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header with auth buttons */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Logo/Brand */}
          <div className="w-8 h-8 rounded-lg bg-[#6c47ff] flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Manila
          </span>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-4 py-2">
            Sign In
          </button>
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5 hover:bg-[#5a3ad6] transition-colors">
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6c47ff]/10 text-[#6c47ff] text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              Dropbox meets ChatGPT
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight mb-6">
              Chat with your documents
              <span className="text-[#6c47ff]">.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-8">
              Upload PDFs, Word docs, and text files. Ask questions in plain English.
              Get instant answers with citations from your source material.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-[#6c47ff] text-white rounded-full font-medium text-base h-12 px-8 hover:bg-[#5a3ad6] transition-colors flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto rounded-full font-medium text-base h-12 px-8 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                See How It Works
              </button>
            </div>
          </div>

          {/* Chat interface preview */}
          <div className="mb-24">
            <ChatPreview />
          </div>

          {/* Features grid */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-4">
              Everything you need to understand your documents
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-12 max-w-xl mx-auto">
              Stop scrolling through pages. Start getting answers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<DocumentIcon className="w-5 h-5 text-[#6c47ff]" />}
                title="Upload Any Document"
                description="Support for PDF, Word, and text files. Simply drag and drop or click to upload your files."
              />
              <FeatureCard
                icon={<ChatBubbleIcon className="w-5 h-5 text-[#6c47ff]" />}
                title="Natural Conversations"
                description="Ask questions in plain English. No need to learn complex query syntax or commands."
              />
              <FeatureCard
                icon={<SparklesIcon className="w-5 h-5 text-[#6c47ff]" />}
                title="AI-Powered Answers"
                description="Get accurate responses with citations pointing directly to the source material in your documents."
              />
            </div>
          </div>

          {/* Trust/Security section */}
          <div className="mt-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <LockIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Your documents are encrypted and private. We never train on your data.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6c47ff] flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Manila
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Built with Next.js, Clerk, and AI
          </p>
        </div>
      </footer>
    </div>
  );
}
