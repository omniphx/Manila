"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

// Icons
function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

export function FileViewerModal({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const [viewMode, setViewMode] = useState<"extracted" | "original">(
    "original"
  );
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const trpc = useTRPC();
  const { getToken } = useAuth();
  const {
    data: document,
    isLoading,
    error,
  } = useQuery(
    trpc.files.getById.queryOptions({ id: documentId, includeContent: true })
  );

  // Fetch the file when switching to original view
  useEffect(() => {
    if (viewMode === "original" && document && !fileUrl && !isLoadingFile) {
      setIsLoadingFile(true);
      const apiBaseUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/trpc"
      ).replace(/\/trpc$/, "");

      // Get Clerk session token and fetch the file
      (async () => {
        try {
          // Get the session token from Clerk
          const token = await getToken();

          const response = await fetch(`${apiBaseUrl}/files/${documentId}`, {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          });

          if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setFileUrl(url);
          setFileError(null);
        } catch (err) {
          console.error("Failed to fetch file:", err);
          setFileError(
            err instanceof Error ? err.message : "Failed to load file"
          );
        } finally {
          setIsLoadingFile(false);
        }
      })();
    }
  }, [viewMode, document, documentId, fileUrl, isLoadingFile, getToken]);

  // Cleanup blob URL only when modal closes (component unmounts)
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileIcon className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {document?.originalFilename || "Loading..."}
                </h2>
                {document && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {document.mimeType} •{" "}
                    {(parseInt(document.size) / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex-shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("original")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "original"
                  ? "bg-[#6c47ff] text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              Original Document
            </button>
            <button
              onClick={() => setViewMode("extracted")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "extracted"
                  ? "bg-[#6c47ff] text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              Extracted Text
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#6c47ff] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-red-500 font-medium">Failed to load document</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                {error.message}
              </p>
            </div>
          ) : viewMode === "extracted" ? (
            <div className="h-full overflow-y-auto p-6 min-h-0">
              {document?.extractedContent ? (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">
                    {document.extractedContent}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    This document has not been processed yet or contains no
                    extractable text.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-0">
              {isLoadingFile ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#6c47ff] animate-spin" />
                </div>
              ) : fileError ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-red-500 font-medium">Failed to load file</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    {fileError}
                  </p>
                </div>
              ) : fileUrl ? (
                document?.mimeType === "application/pdf" ? (
                  <div className="h-full w-full">
                    <iframe
                      src={fileUrl}
                      className="w-full h-full border-0 min-h-0"
                      title={document.originalFilename}
                    />
                  </div>
                ) : document?.mimeType.startsWith("image/") ? (
                  <div className="h-full w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
                    <img
                      src={fileUrl}
                      alt={document.originalFilename}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : document?.mimeType.startsWith("text/") ? (
                  <div className="h-full w-full">
                    <iframe
                      src={fileUrl}
                      className="w-full h-full border-0 min-h-0"
                      title={document.originalFilename}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      Preview not available for this file type
                    </p>
                    <a
                      href={fileUrl}
                      download={document?.originalFilename}
                      className="px-4 py-2 bg-[#6c47ff] text-white rounded-md text-sm font-medium hover:bg-[#5a3ad6] transition-colors"
                    >
                      Download File
                    </a>
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
