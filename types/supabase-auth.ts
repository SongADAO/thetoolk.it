import type { User } from "@supabase/supabase-js";

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
  user: User | null;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export type { AuthContextType, AuthProviderProps };
