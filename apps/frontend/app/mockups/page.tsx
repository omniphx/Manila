import Link from "next/link";

export default function MockupsPage() {
  const mockups = [
    {
      href: "/mockups/chat-main",
      title: "Chat Interface",
      description: "Main chat view with collapsible sidebar and document citations",
    },
    {
      href: "/mockups/file-browser",
      title: "File Browser",
      description: "Folder tree navigation with grid/list toggle and file actions",
    },
    {
      href: "/mockups/chat-with-upload",
      title: "Upload Flow",
      description: "Drag-and-drop upload with progress indicators and processing status",
    },
    {
      href: "/mockups/not-found",
      title: "404 Not Found",
      description: "Friendly page not found with navigation options",
    },
    {
      href: "/mockups/error-page",
      title: "Error Page",
      description: "General error page with retry options and technical details",
    },
    {
      href: "/mockups/backend-status",
      title: "Backend Status",
      description: "Dev-only floating indicator showing backend connection status",
    },
  ];

  return (
    <div>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        UI mockups for Manila - a document chat application.
        These mockups demonstrate the "Dropbox meets ChatGPT" concept.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockups.map((mockup) => (
          <Link
            key={mockup.href}
            href={mockup.href}
            className="block p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-[#6c47ff] hover:bg-[#6c47ff]/5 transition-colors group"
          >
            <h2 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-[#6c47ff]">
              {mockup.title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {mockup.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Design System
        </h3>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <li>Primary accent: <code className="px-1 py-0.5 rounded bg-[#6c47ff]/10 text-[#6c47ff]">#6c47ff</code></li>
          <li>Font: Geist Sans</li>
          <li>Neutral palette: Zinc</li>
          <li>Rounded corners: rounded-lg (cards), rounded-full (buttons)</li>
          <li>Dark mode: Supported via Tailwind dark: prefix</li>
        </ul>
      </div>
    </div>
  );
}
