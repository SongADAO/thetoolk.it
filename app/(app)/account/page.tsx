import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/auth-move/ProtectedRoute";
import { UserProfile } from "@/components/auth-move/UserProfile";
import { SubscriptionManager } from "@/components/SubscriptionManager";

export const metadata: Metadata = {
  alternates: {
    canonical: "/account",
  },
  description:
    "Manage your account settings, view your subscription details, and update your profile information on TheToolk.it.",
  title: "My Account - TheToolk.it",
};

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center gap-8 p-4 pb-10 md:pt-20">
        <UserProfile />

        <SubscriptionManager />
      </div>
    </ProtectedRoute>
  );
}
