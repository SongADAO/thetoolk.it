"use client";

import { useRouter } from "next/navigation";
import { use } from "react";

import { TOTPVerification } from "@/components/auth/TOTPVerification";
import { AuthContext } from "@/contexts/AuthContext";
import { getSafeQueryRedirect } from "@/lib/redirects";

function TOTPVerificationPage() {
  const { signOut, isAuthenticated, needsTOTPVerification, isLoading } =
    use(AuthContext);

  const router = useRouter();

  function handleTOTPVerified() {
    const redirectTo = getSafeQueryRedirect("/pro");
    router.push(redirectTo);
  }

  async function handleTOTPCancel() {
    // Sign out the user since they cancelled MFA verification
    await signOut("local");
    router.push("/auth/signin?error=totp-required");
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="text-center">
        <h2 className="mb-4 text-xl font-bold">Loading...</h2>
      </section>
    );
  }

  // If not authenticated or doesn't need TOTP, show nothing (will redirect)
  if (!isAuthenticated || !needsTOTPVerification) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Two-Factor Authentication</h2>
      <p className="mb-6 text-sm text-gray-600">
        Enter the authentication code from your authenticator app to complete
        sign in.
      </p>
      <TOTPVerification
        onCancel={handleTOTPCancel}
        onVerified={handleTOTPVerified}
      />
    </section>
  );
}

export { TOTPVerificationPage };
