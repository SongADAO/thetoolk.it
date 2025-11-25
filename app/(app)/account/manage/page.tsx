import type { Metadata } from "next";

import { AccountSettings } from "@/components/account/AccountSettings";
import { RequireTOTPVerification } from "@/components/auth/RequireTOTPVerification";

export const metadata: Metadata = {
  alternates: {
    canonical: "/account/manage",
  },
  description: "Manage your account settings and preferences on TheToolk.it.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Manage Account - TheToolk.it",
};

export default function SignInPage() {
  return (
    <RequireTOTPVerification>
      <div className="flex items-center justify-center p-4 md:py-20">
        <div className="w-full">
          <AccountSettings />
        </div>
      </div>
    </RequireTOTPVerification>
  );
}
