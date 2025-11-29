import { SignedIn, SignedOut } from "@clerk/nextjs";
import { HeroSection } from "./components/landing/HeroSection";
import { ChatPreview } from "./components/landing/ChatPreview";
import { FeatureCards } from "./components/landing/FeatureCards";

export default function Home() {
  return (
    <>
      {/* Landing page for unauthenticated users */}
      <SignedOut>
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
          <main className="px-6 pt-16 pb-24">
            <div className="max-w-6xl mx-auto">
              <HeroSection />
              <ChatPreview />
              <FeatureCards />
            </div>
          </main>
        </div>
      </SignedOut>

      {/* Placeholder for authenticated users - will redirect to /chat in Issue #5 */}
      <SignedIn>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <main className="flex flex-col items-center justify-center py-32 px-16">
            <p className="text-zinc-600 dark:text-zinc-400">
              Redirecting to chat...
            </p>
          </main>
        </div>
      </SignedIn>
    </>
  );
}
