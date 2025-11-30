"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { DragDropOverlay } from "../components/DragDropOverlay";
import { uploadFile } from "../actions/upload";
import { trpc } from "@/lib/trpc";

// Icons
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function FolderOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// Helper to get user initials from name
function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
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
          Ready
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
}

function getFileTypeIcon(type: string) {
  const colors: Record<string, string> = {
    pdf: "text-red-500",
    docx: "text-blue-500",
    xlsx: "text-green-500",
    txt: "text-zinc-500",
  };
  return colors[type] || "text-zinc-500";
}

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const utils = trpc.useUtils();

  // Fetch files from backend using tRPC
  const { data: filesData, isLoading, error } = trpc.files.list.useQuery({
    limit: 100,
    offset: 0,
  }, {
    retry: false, // Don't retry on auth errors
    refetchInterval: (data) => {
      // Poll every 2 seconds if any files are processing
      if (!data || !Array.isArray(data)) return false;

      const hasProcessingFiles = data.some(
        (file) => file.processingStatus === 'processing' || file.processingStatus === 'pending'
      );
      return hasProcessingFiles ? 2000 : false;
    },
  });

  // Fetch folders from backend
  const { data: foldersData } = trpc.folders.list.useQuery({
    parentId: undefined, // Get all folders
  });

  // Create folder mutation
  const createFolderMutation = trpc.folders.create.useMutation({
    onSuccess: () => {
      utils.folders.list.invalidate();
      setShowNewFolderModal(false);
      setNewFolderName("");
    },
  });

  // Move file mutation
  const moveFileMutation = trpc.files.move.useMutation({
    onSuccess: () => {
      utils.files.list.invalidate();
    },
  });

  const userName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitials = getInitials(user?.firstName, user?.lastName);
  const userImageUrl = user?.imageUrl;

  const handleFilesDropped = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadFile(formData, selectedFolder);
        if (!result.success) {
          console.error("Upload error:", result.error);
        }
      }
      // Refetch files after upload
      await utils.files.list.invalidate();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFilesDropped(Array.from(files));
      // Reset input
      e.target.value = "";
    }
  };

  // Handle new folder creation
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate({
      name: newFolderName.trim(),
      parentId: selectedFolder || undefined,
    });
  };

  // Handle file drag start
  const handleFileDragStart = (e: React.DragEvent, fileId: string) => {
    setDraggedFileId(fileId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle file drag end
  const handleFileDragEnd = () => {
    setDraggedFileId(null);
    setDragOverFolderId(null);
  };

  // Handle folder drag over
  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle folder drag enter
  const handleFolderDragEnter = (folderId: string | null) => {
    setDragOverFolderId(folderId === null ? "root" : folderId);
  };

  // Handle folder drag leave
  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  // Handle drop on folder
  const handleFolderDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (!draggedFileId) return;

    moveFileMutation.mutate({
      fileId: draggedFileId,
      folderId,
    });

    setDraggedFileId(null);
    setDragOverFolderId(null);
  };

  // Build folder tree from backend data
  const folders = foldersData || [];
  const getFolderChildren = (parentId: string | null) =>
    folders.filter((f) => f.parentId === parentId);

  // Convert backend files to display format and filter by selected folder
  const allDisplayFiles = (filesData || []).map((file) => ({
    id: file.id,
    name: file.originalFilename,
    type: file.mimeType.split("/")[1] || "unknown",
    size: parseInt(file.size),
    folderId: file.folderId,
    processingStatus: file.processingStatus as "pending" | "processing" | "completed" | "failed",
    createdAt: new Date(file.createdAt).toISOString(),
  }));

  // Filter files based on selected folder
  const displayFiles = selectedFolder
    ? allDisplayFiles.filter((f) => f.folderId === selectedFolder)
    : allDisplayFiles.filter((f) => !f.folderId); // Show files without folder when no folder selected

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getBreadcrumbs = () => {
    if (!selectedFolder) {
      return [{ id: null, name: "All Files" }];
    }
    const crumbs: { id: string | null; name: string }[] = [];
    let current = folders.find((f) => f.id === selectedFolder);
    while (current) {
      crumbs.unshift({ id: current.id, name: current.name });
      current = folders.find((f) => f.id === current!.parentId);
    }
    crumbs.unshift({ id: null, name: "All Files" });
    return crumbs;
  };

  const renderFolderTree = (parentId: string | null, depth: number = 0) => {
    const children = getFolderChildren(parentId);
    return children.map((folder) => {
      const hasChildren = getFolderChildren(folder.id).length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolder === folder.id;

      return (
        <div key={folder.id}>
          <button
            onClick={() => {
              setSelectedFolder(folder.id);
              if (hasChildren) toggleFolder(folder.id);
            }}
            onDragOver={handleFolderDragOver}
            onDragEnter={() => handleFolderDragEnter(folder.id)}
            onDragLeave={handleFolderDragLeave}
            onDrop={(e) => handleFolderDrop(e, folder.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
              isSelected
                ? "bg-[#6c47ff]/10 text-[#6c47ff]"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            } ${dragOverFolderId === folder.id ? "bg-[#6c47ff]/20 ring-2 ring-[#6c47ff]" : ""}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-zinc-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-zinc-400" />
              )
            ) : (
              <span className="w-4" />
            )}
            {isSelected ? (
              <FolderOpenIcon className="w-4 h-4 flex-shrink-0 text-[#6c47ff]" />
            ) : (
              <FolderIcon className="w-4 h-4 flex-shrink-0 text-zinc-400" />
            )}
            <span className="text-sm truncate">{folder.name}</span>
          </button>
          {hasChildren && isExpanded && renderFolderTree(folder.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <DragDropOverlay onFilesDropped={handleFilesDropped} className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Folder Tree Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm font-medium text-[#6c47ff] hover:text-[#5a3ad6] transition-colors"
          >
            <ChatIcon className="w-4 h-4" />
            Back to Chat
          </Link>
        </div>

        {/* New Folder Button */}
        <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            New Folder
          </button>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* All Files */}
          <button
            onClick={() => setSelectedFolder(null)}
            onDragOver={handleFolderDragOver}
            onDragEnter={() => handleFolderDragEnter(null)}
            onDragLeave={handleFolderDragLeave}
            onDrop={(e) => handleFolderDrop(e, null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors mb-1 ${
              selectedFolder === null
                ? "bg-[#6c47ff]/10 text-[#6c47ff]"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            } ${dragOverFolderId === "root" ? "bg-[#6c47ff]/20 ring-2 ring-[#6c47ff]" : ""}`}
          >
            <span className="w-4" />
            {selectedFolder === null ? (
              <FolderOpenIcon className="w-4 h-4 flex-shrink-0 text-[#6c47ff]" />
            ) : (
              <FolderIcon className="w-4 h-4 flex-shrink-0 text-zinc-400" />
            )}
            <span className="text-sm truncate">All Files</span>
          </button>
          {renderFolderTree(null)}
        </div>

        {/* User Profile Badge */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
          <Link
            href="/account"
            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {/* Avatar */}
            {userImageUrl ? (
              <img
                src={userImageUrl}
                alt={userName}
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#6c47ff] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {userName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {userEmail}
              </p>
            </div>
            <SettingsIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
              {getBreadcrumbs().map((crumb, index, arr) => (
                <span key={crumb.id || "root"} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedFolder(crumb.id)}
                    className={`hover:text-[#6c47ff] transition-colors ${
                      index === arr.length - 1
                        ? "text-zinc-900 dark:text-zinc-100 font-medium"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {crumb.name}
                  </button>
                  {index < arr.length - 1 && (
                    <ChevronRightIcon className="w-3 h-3 text-zinc-400" />
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#6c47ff] text-white rounded-full text-sm font-medium hover:bg-[#5a3ad6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadIcon className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload"}
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
            />
          </div>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                {error.message || "Failed to load files"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Please sign in to view your files
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#6c47ff] animate-spin mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading files...
              </p>
            </div>
          ) : displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No files uploaded yet
              </p>
              <button
                onClick={handleUploadClick}
                className="mt-4 text-sm text-[#6c47ff] hover:text-[#5a3ad6] font-medium"
              >
                Upload your first file
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleFileDragStart(e, file.id)}
                  onDragEnd={handleFileDragEnd}
                  onClick={() => setSelectedFile(file.id === selectedFile ? null : file.id)}
                  className={`group relative p-4 rounded-lg border transition-all cursor-move ${
                    selectedFile === file.id
                      ? "border-[#6c47ff] bg-[#6c47ff]/5"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                  } ${draggedFileId === file.id ? "opacity-50" : ""}`}
                >
                  {/* File Icon */}
                  <div className="flex justify-center mb-3">
                    <FileIcon className={`w-10 h-10 ${getFileTypeIcon(file.type)}`} />
                  </div>

                  {/* File Name */}
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate text-center">
                    {file.name}
                  </p>

                  {/* File Size */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Status Badge */}
                  <div className="flex justify-center mt-2">
                    {getStatusBadge(file.processingStatus)}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-[#6c47ff] transition-colors shadow-sm">
                      <DownloadIcon className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 transition-colors shadow-sm">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* List Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1"></div>
              </div>

              {/* List Items */}
              {displayFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleFileDragStart(e, file.id)}
                  onDragEnd={handleFileDragEnd}
                  onClick={() => setSelectedFile(file.id === selectedFile ? null : file.id)}
                  className={`group grid grid-cols-12 gap-4 px-4 py-3 rounded-lg items-center transition-colors cursor-move ${
                    selectedFile === file.id
                      ? "bg-[#6c47ff]/5 border border-[#6c47ff]"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  } ${draggedFileId === file.id ? "opacity-50" : ""}`}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <FileIcon className={`w-5 h-5 flex-shrink-0 ${getFileTypeIcon(file.type)}`} />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="col-span-2">{getStatusBadge(file.processingStatus)}</div>
                  <div className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(file.createdAt)}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-[#6c47ff] transition-colors">
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {displayFiles.length} {displayFiles.length === 1 ? "file" : "files"}
          </span>
          <span>
            {displayFiles.filter((f) => f.processingStatus === "completed").length} ready for chat
          </span>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewFolderModal(false)}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Create New Folder
            </h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setShowNewFolderModal(false);
              }}
              placeholder="Folder name"
              autoFocus
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6c47ff] focus:border-transparent"
            />
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
                className="px-4 py-2 bg-[#6c47ff] text-white rounded-md text-sm font-medium hover:bg-[#5a3ad6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createFolderMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DragDropOverlay>
  );
}
