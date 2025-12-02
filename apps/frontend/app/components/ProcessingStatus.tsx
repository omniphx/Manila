"use client";

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export interface ProcessingFile {
  id: string;
  name: string;
  status: "processing" | "completed" | "error";
  progress?: string; // e.g., "Extracting data from 12 sheets"
  pages?: number;
  error?: string;
}

interface ProcessingStatusProps {
  files: ProcessingFile[];
}

export function ProcessingStatus({ files }: ProcessingStatusProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
        M
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Manila
        </p>
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                file.status === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-[#6c47ff]/5 border border-[#6c47ff]/20"
              }`}
            >
              {file.status === "completed" ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : file.status === "error" ? (
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <SpinnerIcon className="w-5 h-5 text-[#6c47ff] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {file.status === "completed" ? (
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    <span className="font-medium">{file.name}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {" "}
                      processed ({file.pages} pages indexed)
                    </span>
                  </p>
                ) : file.status === "error" ? (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Failed to process <span className="font-medium">{file.name}</span>
                    {file.error && (
                      <span className="text-red-500 dark:text-red-400">: {file.error}</span>
                    )}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      Processing <span className="font-medium">{file.name}</span>...
                    </p>
                    {file.progress && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {file.progress}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
