import type { Metadata } from "next";

import { FreeBanner } from "@/components/poster/FreeBanner";
import { Poster } from "@/components/poster/Poster";
import { PosterProviders } from "@/components/poster/PosterProviders";

export const metadata: Metadata = {
  alternates: {
    canonical: "/free",
  },
  description:
    "TheToolk.it Free Edition allows you to create and manage your posts with limited features. Upgrade to Pro for full access.",
  title: "TheToolk.it Free - Create Post",
};

export default function FreePage() {
  return (
    <div>
      <FreeBanner />
      <PosterProviders mode="self">
        <Poster mode="self" />
      </PosterProviders>
    </div>
  );
}
