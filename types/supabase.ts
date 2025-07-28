import { User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    data: any;
    error: any;
  }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    data: any;
    error: any;
  }>;
  signOut: () => Promise<{ error: any }>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
