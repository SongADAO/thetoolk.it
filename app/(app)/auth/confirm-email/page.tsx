import { Suspense } from "react";

import { ConfirmEmail } from "@/components/Auth/ConfirmEmail";

export default function ConfirmEmailPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <Suspense
          fallback={
            <div className="mx-auto max-w-md space-y-4">
              <h2 className="text-2xl font-bold">Loading...</h2>
            </div>
          }
        >
          <ConfirmEmail />
        </Suspense>
      </div>
    </div>
  );
}
