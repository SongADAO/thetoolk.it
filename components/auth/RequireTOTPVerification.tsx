"use client";

import { usePathname, useRouter } from "next/navigation";
import { use, useEffect } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface RequireTOTPVerificationProps {
  children: React.ReactNode;
}

/**
 * Component that checks if user needs TOTP verification and redirects them
 * to the TOTP verification page if they do.
 *
 * Should be used to wrap /account pages to ensure users complete TOTP
 * verification before accessing protected content.
 */
function RequireTOTPVerification({
  children,
}: Readonly<RequireTOTPVerificationProps>) {
  const { needsTOTPVerification, isLoading } = use(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && needsTOTPVerification) {
      // Store the current path to redirect back after TOTP verification
      const redirectPath = encodeURIComponent(pathname);
      router.push(`/auth/verify-totp?redirect=${redirectPath}`);
    }
  }, [needsTOTPVerification, isLoading, router, pathname]);

  // Show loading state while checking
  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // Show nothing while redirecting
  if (needsTOTPVerification) {
    return null;
  }

  // Render children if TOTP verification is not needed
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export { RequireTOTPVerification };
