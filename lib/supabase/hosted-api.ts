import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

async function initServerAuth(): Promise<{
  supabase: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  user: User;
}> {
  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();
  const user = await getUser(supabase);

  return {
    supabase,
    supabaseAdmin,
    user,
  };
}

export { initServerAuth };
