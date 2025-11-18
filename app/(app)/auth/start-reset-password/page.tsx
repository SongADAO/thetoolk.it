import type { Metadata } from "next";

import { StartPasswordResetForm } from "@/components/auth/StartPasswordResetForm";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/start-reset-password",
  },
  description:
    "Start the password reset process by entering your email address.",
  title: "Start Password Reset - TheToolk.it",
};

export default function StartResetPasswordPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <StartPasswordResetForm />
      </div>
    </div>
  );
}
