import type { Metadata } from "next";

import { PostPageProviders } from "@/app/post-page-providers";
import { FreeBanner } from "@/components/FreeBanner";
import { Poster } from "@/components/Poster";

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
      <PostPageProviders mode="self">
        <Poster mode="self" />
      </PostPageProviders>
    </div>
  );
}
