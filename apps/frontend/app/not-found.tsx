import Link from "next/link";

function FileSearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 px-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#6c47ff]/10 flex items-center justify-center">
            <FileSearchIcon className="w-10 h-10 text-[#6c47ff]" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          Page not found
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
          Check the URL or navigate back to continue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#6c47ff] text-white rounded-full text-sm font-medium hover:bg-[#5a3ad6] transition-colors"
          >
            Go to Chat
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
