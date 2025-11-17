import type { Metadata } from "next";

import { PostPageProviders } from "@/app/post-page-providers";
import { Poster } from "@/components/Poster";
import { UpgradeModal } from "@/components/UpgradeModal";

export const metadata: Metadata = {
  alternates: {
    canonical: "/pro",
  },
  description:
    "TheToolk.it Pro Edition offers advanced features and full access to all tools. Upgrade now to enhance your experience and unlock the full potential of TheToolk.it.",
  title: "TheToolk.it Pro",
};

export default function ProPage() {
  return (
    <div>
      <PostPageProviders mode="hosted">
        <Poster mode="hosted" />
      </PostPageProviders>
      <UpgradeModal />
    </div>
  );
}
