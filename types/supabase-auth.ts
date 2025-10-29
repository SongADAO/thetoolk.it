import type { User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import type { KeyedMutator } from "swr";

import type { Subscription } from "@/lib/subscriptions";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signOut: () => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
  }>;
  subscription?: Subscription;
  subscriptionError?: Error;
  subscriptionIsLoading: boolean;
  subscriptionMutate: KeyedMutator<Subscription>;
  user: User | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export type { AuthContextType, AuthProviderProps };
