"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import { uploadFile } from "../actions/upload";
import { trpc } from "@/lib/trpc";

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const utils = trpc.useUtils();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("");
      setError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadStatus("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Call server action
      const result = await uploadFile(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      setUploadStatus(`File "${result.data.originalFilename}" uploaded successfully!`);

      // Invalidate the files list query to trigger a refetch
      await utils.files.list.invalidate();

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus("");
        setSelectedFile(null);
        setError("");
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }, 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <SignedOut>
        <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
            Please sign in to upload files
          </p>
        </div>
      </SignedOut>

      <SignedIn>
        <form onSubmit={handleSubmit} className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div>
            <label
              htmlFor="file-input"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
            >
              Upload File
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.odt"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-900 dark:text-zinc-100
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#6c47ff] file:text-white
                hover:file:bg-[#5a3ad6]
                file:cursor-pointer
                cursor-pointer"
            />
          </div>

          {selectedFile && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5
              hover:bg-[#5a3ad6] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Submit"}
          </button>

          {uploadStatus && (
            <div className="mt-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                {uploadStatus}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}
        </form>
      </SignedIn>
    </div>
  );
}
