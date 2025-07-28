"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { AuthContextType, AuthProviderProps } from "@/types/supabase";

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  // Derived state
  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    // Get initial session
    const getSession = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

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
      user,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, loading, user],
  );

  return (
    <AuthContext.Provider value={providerValues}>
      {children}
    </AuthContext.Provider>
  );
}
