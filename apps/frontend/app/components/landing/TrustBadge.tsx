function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

export function TrustBadge() {
  return (
    <div className="mt-24 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <LockIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Your documents are encrypted and private. We never train on your data.
        </span>
      </div>
    </div>
  );
}
