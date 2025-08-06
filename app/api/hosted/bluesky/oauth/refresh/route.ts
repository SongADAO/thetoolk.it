import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { getOAuthClient } from "@/services/post/bluesky/oauth-client-node";
import { SupabaseSessionStore } from "@/services/post/bluesky/store-session";
import { SupabaseStateStore } from "@/services/post/bluesky/store-state";

async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function POST() {
  try {
    const supabase = await createClient();

    const user = await getUser(supabase);
    const stateStore = new SupabaseStateStore(supabase, user);
    const sessionStore = new SupabaseSessionStore(supabase, user);

    const { data, error } = await supabase
      .from("services")
      .select("service_authorization")
      .eq("user_id", user.id)
      .eq("service_id", "bluesky")
      .single();

    if (error) {
      throw new Error("Could not get tokens to refresh from DB");
    }

    const authorization = data.service_authorization;

    if (!authorization) {
      throw new Error("Could not get tokens to refresh");
    }

    console.log("Authorization data:", authorization);
    // throw new Error("This is a test error to check the flow");

    const client = await getOAuthClient(sessionStore, stateStore);

    await client.restore(authorization.tokenSet.sub);

    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    authorization.refreshTokenExpiresAt = refreshTokenExpiresAt.toISOString();

    const { error: updateError } = await supabase.from("services").upsert(
      {
        service_authorization: authorization,
        service_id: "bluesky",
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

    if (updateError) {
      throw new Error("Failed to store refresh token expiration");
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
