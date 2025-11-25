"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import { TOTPVerification } from "@/components/auth/TOTPVerification";
import { AuthContext } from "@/contexts/AuthContext";

function TOTPVerificationPage() {
  const { signOut, isAuthenticated, needsTOTPVerification, isLoading } =
    use(AuthContext);
  const router = useRouter();

  useEffect(() => {
    console.log(isLoading);
    console.log(isAuthenticated);
    console.log(needsTOTPVerification);
    // If user is not authenticated, redirect to sign in
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }

    // If user doesn't need TOTP verification, redirect to intended destination
    if (!isLoading && isAuthenticated && !needsTOTPVerification) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/pro";
      router.push(redirectTo);
    }
  }, [isAuthenticated, needsTOTPVerification, isLoading, router]);

  function handleTOTPVerified() {
    // Redirect to the intended destination or default to /pro
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "/pro";
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
