import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  getAccounts,
  HOSTED_CREDENTIALS,
} from "@/services/post/twitter/auth";

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
    const { searchParams } = new URL(request.url);

    const supabase = await createClient();

    const user = await getUser(supabase);

    const redirectUri = "";

    const codeVerifier = localStorage.getItem(
      "thetoolkit_twitter_code_verifier",
    );
    // TODO: get code verifier from database.

    if (!codeVerifier) {
      throw new Error(
        "Code verifier not found. Please restart the authorization process.",
      );
    }

    const authorization = await exchangeCodeForTokens(
      searchParams.get("code") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS,
    );

    const accounts = await getAccounts(
      // HOSTED_CREDENTIALS,
      authorization.accessToken,
    );

    const { error } = await supabase.from("services").upsert(
      {
        service_accounts: accounts,
        service_authorization: authorization,
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
