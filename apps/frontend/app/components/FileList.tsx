"use client";

import { useTRPC } from "@/lib/trpc";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function FileList() {
  const { getToken } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [recentUploadTime, setRecentUploadTime] = useState<number | null>(null);

  const {
    data: files,
    isLoading,
    error,
  } = useQuery(
    trpc.files.list.queryOptions(
      {
        limit: 20,
        offset: 0,
      },
      {
        // Poll every 3 seconds if:
        // 1. Any files are processing OR
        // 2. Less than 30 seconds since last upload (to catch fast processing)
        refetchInterval: (query) => {
          const data = query.state.data;
          if (!data || !Array.isArray(data)) return false;

          const hasProcessing = data.some(
            (file) =>
              file.processingStatus === "pending" ||
              file.processingStatus === "processing"
          );

          // If there was a recent upload, keep polling for 30 seconds
          const hasRecentUpload =
            recentUploadTime && Date.now() - recentUploadTime < 30000;

          return hasProcessing || hasRecentUpload ? 3000 : false;
        },
        refetchOnWindowFocus: true,
      }
    )
  );

  const deleteMutation = useMutation(trpc.files.delete.mutationOptions());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingContent, setViewingContent] = useState<{
    id: string;
    filename: string;
    content: string;
  } | null>(null);

  // Track when new files are detected (indicates recent upload)
  useEffect(() => {
    if (files && files.length > 0) {
      const latestFile = files[0]; // Files are sorted by createdAt DESC
      const fileAge = Date.now() - new Date(latestFile.createdAt).getTime();

      // If there's a very recent file (< 5 seconds old), mark as recent upload
      if (fileAge < 5000 && !recentUploadTime) {
        setRecentUploadTime(Date.now());
      }
    }
  }, [files]);

  // Debug logging
  useEffect(() => {
    if (files) {
      console.log("Files data:", files);
      files.forEach((file) => {
        console.log(
          `File: ${file.originalFilename}, Status: ${
            file.processingStatus
          }, Has content: ${!!file.extractedContent}, Content length: ${
            file.extractedContent?.length || 0
          }`
        );
      });
    }
  }, [files]);

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

  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setDeletingId(fileId);
    try {
      await deleteMutation.mutateAsync({ id: fileId });
      // Invalidate the files list query to trigger a refetch
      await queryClient.invalidateQueries({
        queryKey: trpc.files.list.queryKey(),
      });
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Processing...
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            ✓ Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Failed
          </span>
        );
      default:
        return null;
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
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading files...
            </p>
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
                  className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {file.originalFilename}
                        </p>
                        {getStatusBadge(file.processingStatus)}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {(parseInt(file.size) / 1024).toFixed(2)} KB •{" "}
                        {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                      {file.processingError && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {file.processingError}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {file.processingStatus === "completed" &&
                        file.extractedContent && (
                          <button
                            onClick={() =>
                              setViewingContent({
                                id: file.id,
                                filename: file.originalFilename,
                                content: file.extractedContent!,
                              })
                            }
                            className="text-sm text-[#6c47ff] hover:text-[#5a3ad6] font-medium whitespace-nowrap"
                          >
                            View Content
                          </button>
                        )}
                      <button
                        onClick={() =>
                          handleDownload(file.id, file.originalFilename)
                        }
                        className="text-sm text-[#6c47ff] hover:text-[#5a3ad6] font-medium whitespace-nowrap"
                        disabled={deletingId === file.id}
                      >
                        Download
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(file.id, file.originalFilename)
                        }
                        disabled={deletingId === file.id}
                        className="text-sm text-[#6c47ff] hover:text-[#5a3ad6] font-medium disabled:opacity-50 whitespace-nowrap"
                      >
                        {deletingId === file.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SignedIn>

      {/* Content Viewer Modal */}
      {viewingContent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingContent(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {viewingContent.filename}
              </h3>
              <button
                onClick={() => setViewingContent(null)}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap font-mono">
                {viewingContent.content}
              </pre>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingContent.content);
                  alert("Content copied to clipboard!");
                }}
                className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5 hover:bg-[#5a3ad6] transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
