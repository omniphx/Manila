"use server";

import { auth } from "@clerk/nextjs/server";

export async function uploadFile(formData: FormData) {
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

    // Forward the file to the backend
    const response = await fetch("http://localhost:3000/upload", {
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
