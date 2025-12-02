import type { Metadata } from "next";

import { Instructions } from "@/components/instructions/Instructions";

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
    <div className="flex items-center justify-center p-4 md:py-20">
      <div className="w-full">
        <Instructions />
      </div>
    </div>
  );
}
