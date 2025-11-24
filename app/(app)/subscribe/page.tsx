import type { Metadata } from "next";

import { UserSubscription } from "@/components/account/UserSubscription";

export const metadata: Metadata = {
  alternates: {
    canonical: "/subscribe",
  },
  description:
    "Subscribe to TheToolk.it to get access to exclusive content, tools, and resources that will help you grow your business and achieve your goals.",
  title: "Subscribe - TheToolk.it",
};

export default function SubscribePage() {
  return (
    <div className="pt-20">
      <UserSubscription />
    </div>
  );
}
