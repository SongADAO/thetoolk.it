"use client";

import type {
  Factor,
  SignUpWithPasswordCredentials,
  User,
} from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { AuthContext } from "@/contexts/AuthContext";
import type { Subscription } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/client";
import type { AuthContextType, AuthProviderProps } from "@/types/supabase-auth";

// Fetcher function for SWR
async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch subscription status");
  }
  return res.json();
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const supabase = createClient();

  const [factors, setFactors] = useState<Factor[]>([]);
  const [totpFactors, setTotpFactors] = useState<Factor[]>([]);

  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [sessionAALNextLevel, setSessionAALNextLevel] = useState<string>("");
  const [sessionAALCurrentLevel, setSessionAALCurrentLevel] =
    useState<string>("");

  // Derived state
  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  // User needs TOTP verification if:
  // 1. They are authenticated
  // 2. They have factors
  // 3. Their session AAL is aal1 (not aal2, which means MFA verified)
  const needsTOTPVerification = useMemo(
    () =>
      isAuthenticated &&
      factors.length > 0 &&
      sessionAALNextLevel === "aal2" &&
      sessionAALCurrentLevel === "aal1",
    [
      isAuthenticated,
      factors.length,
      sessionAALNextLevel,
      sessionAALCurrentLevel,
    ],
  );

  // Fetch subscription status with SWR
  // Only fetch if user is authenticated
  const {
    data: subscription,
    error: subscriptionError,
    isLoading: subscriptionIsLoading,
    mutate: subscriptionMutate,
  } = useSWR<Subscription>(
    isAuthenticated ? "/api/subscriptions/check-status" : null,
    fetcher,
    {
      dedupingInterval: 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  // Authentication Functions
  // ---------------------------------------------------------------------------

  async function signUp(
    email: string,
    password: string,
    options?: SignUpWithPasswordCredentials["options"],
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      options,
      password,
    });

    return { data, error };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  async function signOut(scope: "local" | "global") {
    const { error } = await supabase.auth.signOut({ scope });

    return { error };
  }

  // 2 Factor Authentication Functions
  // ---------------------------------------------------------------------------

  async function loadFactors() {
    const factorsData = await supabase.auth.mfa.listFactors();

    if (factorsData.data?.all) {
      setFactors(factorsData.data.all);
      setTotpFactors(factorsData.data.totp);
    }
  }

  async function enrollTOTP(friendlyName: string) {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName,
    });

    return { data, error };
  }

  async function verifyTOTPEnrollment(factorId: string, code: string) {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      code,
      factorId,
    });

    return { data, error };
  }

  async function verifyTOTP(code: string) {
    const factorResp = await supabase.auth.mfa.listFactors();

    if (factorResp.data?.totp && factorResp.data.totp.length > 0) {
      // Try each factor until one succeeds
      for (const factor of factorResp.data.totp) {
        // eslint-disable-next-line no-await-in-loop
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
          code,
          factorId: factor.id,
        });

        // If verification succeeds, return immediately
        if (!error) {
          return { data, error: null };
        }
      }

      // If all factors failed, return error
      return {
        data: null,
        error: new Error("TOTP code did not match any enrolled factors"),
      };
    }

    return { data: null, error: new Error("No TOTP factor found") };
  }

  async function unenrollTOTP(factorId: string) {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId });

    return { data, error };
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    subscriptionMutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    async function updateUserData(sessionUser: User | null) {
      setUser(sessionUser);

      // Check MFA level
      if (sessionUser?.factors?.length) {
        const { data: mfaData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        setSessionAALNextLevel(mfaData?.nextLevel ?? "");
        setSessionAALCurrentLevel(mfaData?.currentLevel ?? "");
      } else {
        setSessionAALNextLevel("");
        setSessionAALCurrentLevel("");
      }

      setIsLoading(false);
    }

    // Get initial session
    async function getSession(): Promise<void> {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Initial session:", session);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updateUserData(session?.user ?? null);
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getSession();

    // Listen for auth changes
    const {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      data: { subscription },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", { event, session });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updateUserData(session?.user ?? null);
    });

    // Periodically validate the session
    async function validateSession(): Promise<void> {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        // If there's an error or no user, the session is invalid
        if (error || !currentUser) {
          setUser(null);
          // This will trigger the auth state change listener
          await supabase.auth.signOut({ scope: "local" });
        }
      } catch (error) {
        console.error("Session validation error:", error);
        setUser(null);
      }
    }

    // Validate session every 30 seconds
    // const intervalId = setInterval(() => {
    //   // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //   validateSession();
    // }, 30000);

    // Also validate on visibility change (when user returns to tab)
    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        validateSession();
      }
    }

    // Validate on window focus (when user clicks on the tab/window)
    function handleFocus(): void {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      validateSession();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return () => {
      subscription.unsubscribe();
      // clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [supabase.auth]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.auth]);

  const providerValues: AuthContextType = useMemo(
    () => ({
      enrollTOTP,
      factors,
      isAuthenticated,
      isLoading,
      loadFactors,
      needsTOTPVerification,
      signIn,
      signOut,
      signUp,
      subscription,
      subscriptionError,
      subscriptionIsLoading,
      subscriptionMutate,
      totpFactors,
      unenrollTOTP,
      user,
      verifyTOTP,
      verifyTOTPEnrollment,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      factors,
      isAuthenticated,
      isLoading,
      needsTOTPVerification,
      subscription,
      subscriptionError,
      subscriptionIsLoading,
      totpFactors,
      totpFactors,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={providerValues}>
      {children}
    </AuthContext.Provider>
  );
}
