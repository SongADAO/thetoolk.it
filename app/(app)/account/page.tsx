import type { Metadata } from "next";

import { Account } from "@/components/account/Account";
import { RequireTOTPVerification } from "@/components/auth/RequireTOTPVerification";

export const metadata: Metadata = {
  alternates: {
    canonical: "/account",
  },
  description:
    "Manage your account settings, view your subscription details, and update your profile information on TheToolk.it.",
  robots: {
    follow: false,
    index: false,
  },
  title: "My Account - TheToolk.it",
};

export default function Dashboard() {
  return (
    <RequireTOTPVerification>
      <div className="flex items-center justify-center p-4 md:py-20">
        <div className="w-full">
          <Account />
        </div>
      </div>
    </RequireTOTPVerification>
  );
}
