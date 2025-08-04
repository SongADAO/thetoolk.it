import { createContext } from "react";

import type { AuthContextType } from "@/types/supabase-auth";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  signIn: async () => Promise.resolve({ data: null, error: null }),
  signOut: async () => Promise.resolve({ error: null }),
  signUp: async () => Promise.resolve({ data: null, error: null }),
  user: null,
});

export { AuthContext };
