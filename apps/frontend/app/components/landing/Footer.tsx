export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#6c47ff] flex items-center justify-center">
            <span className="text-white font-bold text-xs">FL</span>
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            FileLlama
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Built with Next.js, Clerk, and AI
        </p>
      </div>
    </footer>
  );
}
