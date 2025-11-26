import type { Metadata } from "next";
import { Suspense } from "react";

import { ConfirmEmail } from "@/components/auth/ConfirmEmail";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/confirm-email",
  },
  description: "Confirm your email address.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Confirm Email - TheToolk.it",
};

export default function ConfirmEmailPage() {
  return (
    <div className="flex items-center justify-center p-4 md:py-20">
      <div className="w-full">
        <div className="mx-auto max-w-2xl space-y-8">
          <Suspense
            fallback={
              <div className="mx-auto max-w-md space-y-4">
                <h1 className="text-2xl font-bold">Loading...</h1>
              </div>
            }
          >
            <ConfirmEmail />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
