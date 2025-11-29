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
    <div className="bg-gray-50">
      <Instructions />
    </div>
  );
}
