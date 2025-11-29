"use client";

import Link from "next/link";

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
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

export function HeroSection() {
  return (
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
        <Link
          href="/sign-up"
          className="w-full sm:w-auto bg-[#6c47ff] text-white rounded-full font-medium text-base h-12 px-8 hover:bg-[#5a3ad6] transition-colors flex items-center justify-center gap-2"
        >
          Get Started Free
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
        <button className="w-full sm:w-auto rounded-full font-medium text-base h-12 px-8 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          See How It Works
        </button>
      </div>
    </div>
  );
}
