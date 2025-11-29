"use client";

import { useState } from "react";

/**
 * Account/Profile Page Mockup
 *
 * Design Decisions:
 * - Single-column layout for focused settings experience
 * - Profile section at top shows Clerk-managed info (avatar, name, email)
 * - Clear section separation with cards for different setting categories
 * - Toggle switches for binary preferences (consistent with modern settings UIs)
 * - Danger zone at bottom with red accents to indicate destructive actions
 * - "Manage in Clerk" buttons indicate Clerk-handled functionality
 *
 * Trade-offs:
 * - Read-only profile display since Clerk handles profile editing
 * - Kept notification options simple rather than granular per-notification-type
 * - Single danger zone action (delete) rather than multiple destructive options
 *
 * Clerk Integration Notes:
 * - Avatar, name, and email are managed by Clerk and displayed read-only
 * - "Edit Profile" redirects to Clerk's user profile modal
 * - Connected accounts section could use Clerk's OAuth connections
 */

// Mock user data (in production, this comes from Clerk's useUser hook)
const mockUser = {
  firstName: "Alex",
  lastName: "Chen",
  fullName: "Alex Chen",
  email: "alex.chen@example.com",
  imageUrl: null, // null to show initials, or a URL for avatar
  createdAt: "2024-06-15T10:30:00Z",
};

// Mock connected accounts (could integrate with Clerk OAuth)
const mockConnectedAccounts = [
  { id: "google", name: "Google", email: "alex.chen@gmail.com", connected: true },
  { id: "github", name: "GitHub", email: null, connected: false },
  { id: "dropbox", name: "Dropbox", email: null, connected: false },
];

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

// Toggle Switch component
function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6c47ff] focus:ring-offset-2 ${
        enabled ? "bg-[#6c47ff]" : "bg-zinc-200 dark:bg-zinc-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// Section wrapper component for consistent styling
function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

// Setting row component for consistent list items
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </p>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function AccountMockup() {
  // State for toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [processingAlerts, setProcessingAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back navigation */}
      <button className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-[#6c47ff] mb-6 transition-colors">
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Chat
      </button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Account Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsSection
          icon={UserIcon}
          title="Profile"
          description="Your profile is managed by Clerk"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {mockUser.imageUrl ? (
              <img
                src={mockUser.imageUrl}
                alt={mockUser.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#6c47ff] flex items-center justify-center text-white text-xl font-semibold">
                {getInitials(mockUser.fullName)}
              </div>
            )}

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {mockUser.fullName}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {mockUser.email}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Member since {formatDate(mockUser.createdAt)}
              </p>
            </div>

            {/* Edit button - opens Clerk modal */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6c47ff] border border-[#6c47ff] rounded-lg hover:bg-[#6c47ff]/5 transition-colors">
              Edit Profile
              <ExternalLinkIcon className="w-4 h-4" />
            </button>
          </div>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection
          icon={BellIcon}
          title="Notifications"
          description="Choose how you want to be notified"
        >
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <SettingRow
              label="Email notifications"
              description="Receive updates about your documents via email"
            >
              <Toggle
                enabled={emailNotifications}
                onChange={setEmailNotifications}
              />
            </SettingRow>
            <SettingRow
              label="Weekly digest"
              description="Get a summary of activity every week"
            >
              <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} />
            </SettingRow>
            <SettingRow
              label="Processing alerts"
              description="Notify when document processing completes or fails"
            >
              <Toggle
                enabled={processingAlerts}
                onChange={setProcessingAlerts}
              />
            </SettingRow>
          </div>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection
          icon={ShieldIcon}
          title="Appearance"
          description="Customize how Manila looks for you"
        >
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <SettingRow
              label="Dark mode"
              description="Use dark theme across the application"
            >
              <Toggle enabled={darkMode} onChange={setDarkMode} />
            </SettingRow>
            <SettingRow
              label="Compact view"
              description="Show more content with reduced spacing"
            >
              <Toggle enabled={compactView} onChange={setCompactView} />
            </SettingRow>
          </div>
        </SettingsSection>

        {/* Connected Accounts Section */}
        <SettingsSection
          icon={LinkIcon}
          title="Connected Accounts"
          description="Link external services for easier file imports"
        >
          <div className="space-y-3">
            {mockConnectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {/* Service icon placeholder - using a generic circle */}
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {account.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {account.name}
                    </p>
                    {account.connected && account.email && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {account.email}
                      </p>
                    )}
                  </div>
                </div>

                {account.connected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckIcon className="w-3.5 h-3.5" />
                      Connected
                    </span>
                    <button className="text-sm text-zinc-500 hover:text-red-500 transition-colors">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-3">
              <TrashIcon className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-500/70 dark:text-red-400/70 mt-0.5">
                  Irreversible actions
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Delete account
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Permanently delete your account and all associated data
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    Confirm Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-4">
          Authentication and security settings are managed through Clerk.{" "}
          <button className="text-[#6c47ff] hover:underline">
            Open security settings
          </button>
        </p>
      </div>
    </div>
  );
}
