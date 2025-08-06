import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

async function initServerAuth(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const user = await getUser(supabase);

  return {
    supabase,
    user,
  };
}

export { initServerAuth };
