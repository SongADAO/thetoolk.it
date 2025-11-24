import type { Metadata } from "next";

import { LinkButton } from "@/components/general/LinkButton";

export const metadata: Metadata = {
  alternates: {
    canonical: "/subscribe/success",
  },
  description:
    "Thank you for subscribing to TheToolk.it Pro! Your payment was successful, and you can now start using all the features of TheToolk.it Pro. Click the button below to get started.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Subscribe Success - TheToolk.it",
};

export default function SubscribeSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 md:py-20">
      <p>Thanks for subscribing! Your payment was successful.</p>
      <LinkButton href="/pro">Start Using TheToolk.it Pro</LinkButton>
    </div>
  );
}
