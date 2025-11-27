"use client";

import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";

export function FileList() {
  const { getToken } = useAuth();
  const { data: files, isLoading, error } = trpc.files.list.useQuery({ limit: 20, offset: 0 });

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
    }
  };

  return (
    <div className="w-full max-w-md">
      <SignedOut>
        <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
            Please sign in to view your files
          </p>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Your Files
          </h2>

          {isLoading && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading files...</p>
          )}

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                Failed to load files: {error.message}
              </p>
            </div>
          )}

          {files && files.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No files uploaded yet
            </p>
          )}

          {files && files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {file.originalFilename}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {(parseInt(file.size) / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(file.id, file.originalFilename)}
                    className="ml-4 text-sm text-[#6c47ff] hover:text-[#5a3ad6] font-medium"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  );
}
