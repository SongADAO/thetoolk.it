import type { Metadata } from "next";
import { Suspense } from "react";

import { ConfirmEmail } from "@/components/Auth/ConfirmEmail";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/confirm-email",
  },
  description: "Confirm your email address.",
  title: "Confirm Email - TheToolk.it",
};

export default function ConfirmEmailPage() {
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
          <ConfirmEmail />
        </Suspense>
      </div>
    </div>
  );
}
