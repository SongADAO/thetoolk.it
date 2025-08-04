import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  getAccounts,
  HOSTED_CREDENTIALS,
} from "@/services/post/facebook/auth";

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
    // eslint-disable-next-line camelcase
    const { code, redirect_uri } = await request.json();

    const supabase = await createClient();

    const user = await getUser(supabase);

    const newAuthorization = await exchangeCodeForTokens(
      code,
      redirect_uri,
      HOSTED_CREDENTIALS,
    );

    const accounts = await getAccounts(newAuthorization.accessToken);

    const { error } = await supabase.from("services").upsert(
      {
        service_accounts: accounts,
        service_authorization: newAuthorization,
        service_id: "facebook",
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

    if (error) {
      throw new Error("Could not get accounts");
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const errMessage = err instanceof Error ? err.message : "Auth failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
