import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedOut,
} from "@clerk/nextjs";
import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";
import { TRPCProvider } from "./providers/trpc-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FileLlama - Chat with Your Documents Using AI",
    template: "%s | FileLlama",
  },
  description:
    "Upload PDFs, Word docs, and text files. Ask questions in plain English and get instant answers with citations from your documents. Like ChatGPT for your files.",
  keywords: [
    "document chat",
    "AI document analysis",
    "PDF chat",
    "document Q&A",
    "AI document assistant",
    "document search",
    "ChatGPT for documents",
    "document intelligence",
    "file chat",
    "AI file analysis",
  ],
  authors: [{ name: "FileLlama" }],
  creator: "FileLlama",
  publisher: "FileLlama",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://filellama.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "FileLlama - Chat with Your Documents Using AI",
    description:
      "Upload PDFs, Word docs, and text files. Ask questions in plain English and get instant answers with citations from your documents.",
    siteName: "FileLlama",
  },
  twitter: {
    card: "summary_large_image",
    title: "FileLlama - Chat with Your Documents Using AI",
    description:
      "Upload PDFs, Word docs, and text files. Ask questions in plain English and get instant answers with citations.",
    creator: "@filellama",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <TRPCProvider>
            <Toaster position="top-right" richColors />
            {/* Header only shown for signed-out users */}
            <SignedOut>
              <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
                {/* Logo/Brand */}
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#6c47ff] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FL</span>
                  </div>
                  <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    FileLlama
                  </span>
                </Link>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                  <SignInButton>
                    <button className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-4 py-2">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5 hover:bg-[#5a3ad6] transition-colors cursor-pointer">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </header>
            </SignedOut>
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
