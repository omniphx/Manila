"use server";

import { auth } from "@clerk/nextjs/server";

export async function uploadFile(formData: FormData, folderId?: string | null) {
  try {
    // Get auth token server-side
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Add folderId to FormData if provided
    if (folderId) {
      formData.append("folderId", folderId);
    }

    // Forward the file to the backend
    // Server Actions run server-side, so we need to call the backend API directly
    const apiUrl = process.env.VERCEL_URL
      ? "https://api.filellama.ai"  // Production: call backend directly
      : "http://localhost:3000";      // Local: call local backend
    const response = await fetch(`${apiUrl}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || errorData.message || "Upload failed",
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}
