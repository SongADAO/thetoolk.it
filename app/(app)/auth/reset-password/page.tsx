import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/Auth/ResetPasswordForm";

export default function SignInPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
