'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'ok' | 'error' | 'checking';
  timestamp?: string;
  uptime?: number;
  error?: string;
}

export function BackendStatus() {
  const [health, setHealth] = useState<HealthStatus>({ status: 'checking' });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const response = await fetch('http://localhost:3000/health');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setHealth({
        status: 'ok',
        timestamp: data.timestamp,
        uptime: data.uptime,
      });
      setLastChecked(new Date());
    } catch (error) {
      setHealth({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (health.status) {
      case 'ok':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (health.status) {
      case 'ok':
        return 'Connected';
      case 'error':
        return 'Disconnected';
      case 'checking':
        return 'Checking...';
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Backend Status
        </h3>
        <button
          onClick={checkHealth}
          className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {getStatusText()}
        </span>
      </div>

      {health.status === 'ok' && (
        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Uptime:</span>
            <span className="font-mono">{formatUptime(health.uptime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Last checked:</span>
            <span className="font-mono">
              {lastChecked?.toLocaleTimeString() || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {health.status === 'error' && (
        <div className="text-xs text-red-600 dark:text-red-400">
          <p className="font-semibold mb-1">Cannot connect to backend</p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Make sure the backend is running on http://localhost:3000
          </p>
          {health.error && (
            <p className="mt-1 font-mono text-[10px]">Error: {health.error}</p>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Open Backend →
        </a>
      </div>
    </div>
  );
}
