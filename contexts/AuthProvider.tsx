"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { AuthContext } from "@/contexts/AuthContext";
import type { Subscription } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/client";
import type { AuthContextType, AuthProviderProps } from "@/types/supabase-auth";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch subscription status");
  }
  return res.json();
};

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
    const getSession = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

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

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return () => subscription?.unsubscribe();
  }, [supabase.auth]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const providerValues: AuthContextType = useMemo(
    () => ({
      isAuthenticated,
      loading,
      signIn,
      signOut,
      signUp,
      subscription,
      subscriptionError,
      subscriptionIsLoading,
      subscriptionMutate,
      user,
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
