import { createServerClient } from "@supabase/ssr";

export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://server-mode-disabled.test",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "server-mode-disabled",
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}
