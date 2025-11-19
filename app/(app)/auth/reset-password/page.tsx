import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/reset-password",
  },
  description: "Reset your password for TheToolk.it account.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Reset Password - TheToolk.it",
};
export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <Suspense
          fallback={
            <div className="mx-auto max-w-md space-y-4">
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
