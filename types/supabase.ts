import { User } from "@supabase/supabase-js";

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    data: any;
    error: any;
  }>;
  signOut: () => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    data: any;
    error: any;
  }>;
  user: User | null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
