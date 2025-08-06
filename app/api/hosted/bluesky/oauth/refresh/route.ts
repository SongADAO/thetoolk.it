import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAccountsFromAgent } from "@/services/post/bluesky/auth";
import { createAgent } from "@/services/post/bluesky/oauth-client-node";
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

export async function POST(request: NextRequest) {
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

    const agent = await createAgent(
      sessionStore,
      stateStore,
      authorization.sub,
    );

    const accounts = await getAccountsFromAgent(agent, authorization.sub);

    console.log("Accounts:", accounts);

    // const newAuthorization = await refreshAccessToken(authorization);

    // const { error: authorizationError } = await supabase
    //   .from("services")
    //   .upsert(
    //     {
    //       service_authorization: newAuthorization,
    //       service_id: 'bluesky',
    //       user_id: user.id,
    //     },
    //     {
    //       onConflict: "user_id,service_id",
    //     },
    //   );

    // if (authorizationError) {
    //   throw new Error("Could not refresh token");
    // }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
