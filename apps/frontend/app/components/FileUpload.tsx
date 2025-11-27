"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    // For now, just show success message since no backend integration
    setUploadStatus(`File "${selectedFile.name}" ready to upload (${(selectedFile.size / 1024).toFixed(2)} KB)`);

    // Reset after 3 seconds
    setTimeout(() => {
      setUploadStatus("");
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }, 3000);
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
            disabled={!selectedFile}
            className="w-full bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5
              hover:bg-[#5a3ad6] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>

          {uploadStatus && (
            <div className="mt-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                {uploadStatus}
              </p>
            </div>
          )}
        </form>
      </SignedIn>
    </div>
  );
}
