import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import {
  HOSTED_CREDENTIALS,
  refreshAccessToken,
} from "@/services/post/youtube/auth";

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

    const { data, error } = await supabase
      .from("services")
      .select("service_authorization")
      .eq("user_id", user.id)
      .eq("service_id", "youtube")
      .single();

    if (error) {
      throw new Error("Could not get tokens to refresh from DB");
    }

    const authorization = data.service_authorization;

    if (!authorization) {
      throw new Error("Could not get tokens to refresh");
    }

    const newAuthorization = await refreshAccessToken(
      HOSTED_CREDENTIALS,
      authorization,
    );

    const { error: authorizationError } = await supabase
      .from("services")
      .upsert(
        {
          service_authorization: newAuthorization,
          service_id: "youtube",
          user_id: user.id,
        },
        {
          onConflict: "user_id,service_id",
        },
      );

    if (authorizationError) {
      throw new Error("Could not refresh token");
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
