import Link from "next/link";

export default function MockupsPage() {
  return (
    <div>
      <p className="text-gray-600 mb-6">
        Add your mockup pages as subdirectories under{" "}
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          app/mockups/
        </code>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Example mockup link - add more as you create them */}
        {/*
        <Link
          href="/mockups/example"
          className="block p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
        >
          <h2 className="font-medium">Example Mockup</h2>
          <p className="text-sm text-gray-500 mt-1">Description of the mockup</p>
        </Link>
        */}

        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-400">
          <p>No mockups yet</p>
          <p className="text-sm mt-1">Create a folder under app/mockups/</p>
        </div>
      </div>
    </div>
  );
}
