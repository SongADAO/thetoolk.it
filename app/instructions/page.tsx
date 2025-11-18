import type { Metadata } from "next";

import { Instructions } from "@/components/instructions/Instructions";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppLogo } from "@/components/layout/AppLogo";

export const metadata: Metadata = {
  alternates: {
    canonical: "/instructions",
  },
  description:
    "TheToolk.it is a free web app for cross-posting across social media. This page contains setup instructions for using the app.",
  title: "Instructions - TheToolk.it",
};

export default function InstructionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 right-0 left-0 z-40">
        <div className="flex items-center justify-between bg-gray-200 p-2">
          <div>
            <AppLogo />
          </div>
          <span className="text-md text-gray-600">Setup Instructions</span>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="flex-1 pt-16 pb-16">
        <Instructions />
      </main>

      {/* Fixed Footer */}
      <footer className="fixed right-0 bottom-0 left-0 z-40 bg-gray-200 shadow-md">
        <AppFooter />
      </footer>
    </div>
  );
}
