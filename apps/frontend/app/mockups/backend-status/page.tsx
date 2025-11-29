"use client";

import { useState } from "react";

/**
 * Backend Status Indicator Mockup (Dev-only)
 *
 * Design Decisions:
 * - Floating badge in bottom-right corner - unobtrusive but always visible
 * - Color-coded status: green (connected), yellow (connecting), red (disconnected)
 * - Click to expand for detailed information (uptime, last ping, API URL)
 * - Technical/informative tone since this is for developers only
 * - Shows all three states in demo view for easy review
 *
 * Trade-offs:
 * - Positioned bottom-right to avoid conflict with chat input areas
 * - Collapsed by default to minimize screen real estate
 * - Includes auto-dismiss option in expanded view for convenience
 */

type ConnectionStatus = "connected" | "connecting" | "disconnected";

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  );
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}

// Status configuration
const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; bgColor: string; dotColor: string; description: string }
> = {
  connected: {
    label: "Connected",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    dotColor: "bg-green-500",
    description: "Backend API is responding normally",
  },
  connecting: {
    label: "Connecting...",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    dotColor: "bg-yellow-500",
    description: "Attempting to connect to backend",
  },
  disconnected: {
    label: "Disconnected",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    dotColor: "bg-red-500",
    description: "Unable to reach backend API",
  },
};

// Mock data for different states
const mockStatusData: Record<ConnectionStatus, {
  uptime: string;
  lastPing: string;
  latency: string;
  apiUrl: string;
  version: string;
}> = {
  connected: {
    uptime: "4h 23m 12s",
    lastPing: "Just now",
    latency: "42ms",
    apiUrl: "http://localhost:3001",
    version: "1.2.0",
  },
  connecting: {
    uptime: "-",
    lastPing: "Attempting...",
    latency: "-",
    apiUrl: "http://localhost:3001",
    version: "-",
  },
  disconnected: {
    uptime: "-",
    lastPing: "5 minutes ago",
    latency: "-",
    apiUrl: "http://localhost:3001",
    version: "-",
  },
};

/**
 * BackendStatusIndicator Component
 * This is the actual component that would be used in production
 */
function BackendStatusIndicator({
  status,
  position = "bottom-right",
}: {
  status: ConnectionStatus;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[status];
  const data = mockStatusData[status];

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Expanded Panel */}
      {expanded && (
        <div className="mb-2 w-72 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`px-4 py-3 ${config.bgColor} border-b border-zinc-200 dark:border-zinc-700`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ServerIcon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>
                  Backend Status
                </span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {config.description}
            </p>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs">Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${config.dotColor} ${status === "connecting" ? "animate-pulse" : ""}`} />
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs">Latency</span>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-0.5">
                  {data.latency}
                </p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs">Uptime</span>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-0.5">
                  {data.uptime}
                </p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs">Last Ping</span>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-0.5">
                  {data.lastPing}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-500 dark:text-zinc-400 text-xs">API URL</span>
              <code className="block mt-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                {data.apiUrl}
              </code>
            </div>

            {data.version !== "-" && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Version: {data.version}
              </div>
            )}

            {/* Retry Button (only when disconnected) */}
            {status === "disconnected" && (
              <button className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-[#6c47ff] text-white rounded-lg text-sm font-medium hover:bg-[#5a3ad6] transition-colors">
                <ArrowPathIcon className="w-4 h-4" />
                Retry Connection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full ${config.bgColor} border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor} ${status === "connecting" ? "animate-pulse" : ""}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        <WifiIcon className={`w-4 h-4 ${config.color}`} />
      </button>
    </div>
  );
}

/**
 * Demo Page showing all states
 */
export default function BackendStatusMockup() {
  const [activeDemo, setActiveDemo] = useState<ConnectionStatus>("connected");

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Backend Status Indicator
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A floating dev-only component that shows real-time backend connection status.
          This would appear on all pages during development.
        </p>
      </div>

      {/* State Selector */}
      <div className="mb-8 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Demo State Selector
        </h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(statusConfig) as ConnectionStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveDemo(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeDemo === status
                  ? "bg-[#6c47ff] text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {statusConfig[status].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Click a state to see how the indicator looks. The floating badge will appear in the bottom-right corner.
        </p>
      </div>

      {/* All States Preview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          All States Preview
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(statusConfig) as ConnectionStatus[]).map((status) => {
            const config = statusConfig[status];
            const data = mockStatusData[status];
            return (
              <div
                key={status}
                className={`p-4 rounded-lg border ${
                  activeDemo === status
                    ? "border-[#6c47ff] ring-2 ring-[#6c47ff]/20"
                    : "border-zinc-200 dark:border-zinc-800"
                } bg-white dark:bg-zinc-900`}
              >
                {/* Badge Preview */}
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${config.bgColor} mb-4`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor} ${status === "connecting" ? "animate-pulse" : ""}`} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  <WifiIcon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* State Info */}
                <h3 className={`font-medium ${config.color} mb-1`}>{config.label}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {config.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Latency:</span>
                    <span className="ml-1 text-zinc-700 dark:text-zinc-300">{data.latency}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Uptime:</span>
                    <span className="ml-1 text-zinc-700 dark:text-zinc-300">{data.uptime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Notes */}
      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Implementation Notes
        </h2>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
          <li>Only render in development mode (<code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs">process.env.NODE_ENV === &quot;development&quot;</code>)</li>
          <li>Place in root layout to appear on all pages</li>
          <li>Use a health check endpoint with polling (e.g., every 30 seconds)</li>
          <li>Consider using WebSocket for real-time status updates</li>
          <li>Store collapsed/expanded state in localStorage for persistence</li>
        </ul>
      </div>

      {/* Live Demo Indicator */}
      <BackendStatusIndicator status={activeDemo} />
    </div>
  );
}
