import type { Metadata } from "next";

import { UserProfile } from "@/components/account/UserProfile";
import { UserSubscription } from "@/components/account/UserSubscription";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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

        <UserSubscription />
      </div>
    </ProtectedRoute>
  );
}
