import type { Metadata } from "next";

import { LinkButton } from "@/components/general/LinkButton";

export const metadata: Metadata = {
  alternates: {
    canonical: "/subscribe/cancel",
  },
  description:
    "You cancelled your subscription checkout before completing it. You have not been charged. Click the button below to return to TheToolk.it.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Subscribe Cancelled - TheToolk.it",
};

export default function SubscribeCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 md:py-20">
      <p>
        You cancelled your subscription checkout before completing it. You have
        not been charged.
      </p>
      <LinkButton href="/pro">Return to TheToolk.it</LinkButton>
    </div>
  );
}
