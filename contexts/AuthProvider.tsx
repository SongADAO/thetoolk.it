"use client";

import type {
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
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  // Derived state
  const isAuthenticated = useMemo(() => Boolean(user), [user]);

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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    subscriptionMutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // Get initial session
    async function getSession(): Promise<void> {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getSession();

    // Listen for auth changes
    const {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      data: { subscription },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
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

  async function enrollTOTP() {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    return { data, error };
  }

  async function verifyTOTPEnrollment(code: string) {
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.data?.totp && factors.data.totp.length > 0) {
      const factorId = factors.data.totp[0].id;
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        code,
        factorId,
      });

      return { data, error };
    }

    return { data: null, error: new Error("No TOTP factor found") };
  }

  async function verifyTOTP(code: string) {
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.data?.totp && factors.data.totp.length > 0) {
      const factorId = factors.data.totp[0].id;
      const challenge = await supabase.auth.mfa.challenge({ factorId });

      if (challenge.error) {
        return { data: null, error: challenge.error };
      }

      const { data, error } = await supabase.auth.mfa.verify({
        challengeId: challenge.data.id,
        code,
        factorId,
      });

      return { data, error };
    }

    return { data: null, error: new Error("No TOTP factor found") };
  }

  async function unenrollTOTP(factorId: string) {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId });

    return { data, error };
  }

  const providerValues: AuthContextType = useMemo(
    () => ({
      enrollTOTP,
      isAuthenticated,
      loading,
      signIn,
      signOut,
      signUp,
      subscription,
      subscriptionError,
      subscriptionIsLoading,
      subscriptionMutate,
      unenrollTOTP,
      user,
      verifyTOTP,
      verifyTOTPEnrollment,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isAuthenticated,
      loading,
      subscription,
      subscriptionError,
      subscriptionIsLoading,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={providerValues}>
      {children}
    </AuthContext.Provider>
  );
}
