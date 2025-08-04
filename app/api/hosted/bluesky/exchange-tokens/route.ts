import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  HOSTED_CREDENTIALS,
} from "@/services/post/bluesky/auth";

async function getUser(supabase: SupabaseClient) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const user = await getUser(supabase);

    const authorization = await exchangeCodeForTokens(HOSTED_CREDENTIALS);

    const { error } = await supabase.from("services").upsert(
      {
        service_authorization: authorization,
        service_id: "bluesky",
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

    if (error) {
      throw new Error("Could not exchange authorization code");
    }

    return Response.json({
      accessTokenExpiresAt: authorization.accessTokenExpiresAt,
      refreshTokenExpiresAt: authorization.refreshTokenExpiresAt,
    });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
