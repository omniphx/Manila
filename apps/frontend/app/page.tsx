import Image from "next/image";
import { BackendStatus } from "./components/BackendStatus";
import { FileUpload } from "./components/FileUpload";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            File RAG Scanner
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A full-stack application with Next.js frontend and Fastify backend with tRPC.
          </p>

          <div className="w-full max-w-md mt-4">
            <BackendStatus />
          </div>

          <div className="w-full max-w-md mt-6">
            <FileUpload />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-6">
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                Frontend
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Next.js 15 with App Router
              </p>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                Backend
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Fastify + tRPC + PostgreSQL
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm font-medium sm:flex-row w-full">
          <a
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Backend API
          </a>
          <a
            className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
