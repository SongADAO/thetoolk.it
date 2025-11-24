import { createContext } from "react";

import type { AuthContextType } from "@/types/supabase-auth";

const AuthContext = createContext<AuthContextType>({
  enrollTOTP: async () => Promise.resolve({ data: null, error: null }),
  factors: [],
  isAuthenticated: false,
  isLoading: true,
  loadFactors: async () => Promise.resolve(undefined),
  signIn: async () => Promise.resolve({ data: null, error: null }),
  signOut: async () => Promise.resolve({ error: null }),
  signUp: async () => Promise.resolve({ data: null, error: null }),
  subscription: undefined,
  subscriptionError: undefined,
  subscriptionIsLoading: false,
  subscriptionMutate: async () => Promise.resolve(undefined),
  unenrollTOTP: async () => Promise.resolve({ data: null, error: null }),
  user: null,
  verifyTOTP: async () => Promise.resolve({ data: null, error: null }),
  verifyTOTPEnrollment: async () =>
    Promise.resolve({ data: null, error: null }),
});

export { AuthContext };
