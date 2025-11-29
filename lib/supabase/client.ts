import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://server-mode-disabled.test",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "server-mode-disabled",
  );
}
