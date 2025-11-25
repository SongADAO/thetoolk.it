"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, use, useEffect } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface Props {
  children: ReactNode;
}

/**
 * Component that checks if user needs authentication and redirects them
 * to the authentication page if they do.
 */
function RequireAuthentication({ children }: Readonly<Props>) {
  const { isLoading, isAuthenticated } = use(AuthContext);

  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after TOTP verification
      const redirectPath = encodeURIComponent(pathname);
      router.push(`/auth/signin?redirect=${redirectPath}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking
  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Render children if TOTP verification is not needed
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export { RequireAuthentication };
