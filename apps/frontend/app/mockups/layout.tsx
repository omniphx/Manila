import { notFound } from "next/navigation";

export default function MockupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only allow access in development mode
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Mockups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Development only - not available in production
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
