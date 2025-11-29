import type { Metadata } from "next";

import { PosterBrowserMode } from "@/components/poster/PosterBrowserMode";

export const metadata: Metadata = {
  alternates: {
    canonical: "/free",
  },
  description:
    "TheToolk.it Free Edition allows you to create and manage your posts with limited features. Upgrade to Pro for full access.",
  title: "TheToolk.it Free - Create Post",
};

export default function FreePage() {
  return <PosterBrowserMode />;
}
