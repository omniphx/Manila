import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HeroSection } from "./components/landing/HeroSection";
import { ChatPreview } from "./components/landing/ChatPreview";
import { FeatureCards } from "./components/landing/FeatureCards";
import { TrustBadge } from "./components/landing/TrustBadge";
import { Footer } from "./components/landing/Footer";

export default async function Home() {
  const { userId } = await auth();

  // Redirect authenticated users to chat
  if (userId) {
    redirect("/chat");
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto">
          <HeroSection />
          <ChatPreview />
          <FeatureCards />
          <TrustBadge />
        </div>
      </main>
      <Footer />
    </div>
  );
}
