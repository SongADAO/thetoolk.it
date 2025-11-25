import type { Metadata } from "next";

import { TOTPVerificationPage } from "@/components/auth/TOTPVerificationPage";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/verify-totp",
  },
  description:
    "Verify your two-factor authentication code to access your account.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Two-Factor Authentication - TheToolk.it",
};

export default function VerifyTOTPPage() {
  return (
    <div className="flex items-center justify-center p-4 md:py-20">
      <div className="w-full max-w-md">
        <TOTPVerificationPage />
      </div>
    </div>
  );
}
