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
    // Use absolute URL for server-side fetch in production, relative for local dev
    const apiUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
