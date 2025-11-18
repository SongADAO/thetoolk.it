import type { Metadata } from "next";

import { Poster } from "@/components/Poster";
import { PosterProviders } from "@/components/PosterProviders";
import { UpgradeModal } from "@/components/UpgradeModal";

export const metadata: Metadata = {
  alternates: {
    canonical: "/pro",
  },
  description:
    "TheToolk.it Pro Edition offers advanced features and full access to all tools. Upgrade now to enhance your experience and unlock the full potential of TheToolk.it.",
  title: "TheToolk.it Pro - Create Post",
};

export default function ProPage() {
  return (
    <div>
      <PosterProviders mode="hosted">
        <Poster mode="hosted" />
      </PosterProviders>
      <UpgradeModal />
    </div>
  );
}
