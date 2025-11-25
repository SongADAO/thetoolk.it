import type { Metadata } from "next";

import { RequireTOTPVerification } from "@/components/auth/RequireTOTPVerification";
import { Poster } from "@/components/poster/Poster";
import { PosterProviders } from "@/components/poster/PosterProviders";
import { UpgradeModal } from "@/components/subscriptions/UpgradeModal";

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
    <RequireTOTPVerification>
      <div>
        <PosterProviders mode="server">
          <Poster mode="server" />
        </PosterProviders>
        <UpgradeModal />
      </div>
    </RequireTOTPVerification>
  );
}
