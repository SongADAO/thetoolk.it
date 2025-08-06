import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const successUrl = new URL(`${baseUrl}/authorize-success`);
  const errorUrl = new URL(`${baseUrl}/authorize-error`);

  try {
    const { searchParams } = new URL(request.url);

    const supabase = await createClient();

    const user = await getUser(supabase);

    const redirectUri = `${baseUrl}/api/hosted/twitter/oauth/callback`;

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

    // Redirect back to the application
    successUrl.searchParams.set("service", "twitter");
    successUrl.searchParams.set("auth", "success");

    return NextResponse.redirect(successUrl.toString());
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    // Redirect to app with error
    errorUrl.searchParams.set("service", "twitter");
    errorUrl.searchParams.set("error", "callback_failed");
    errorUrl.searchParams.set("error_description", errMessage);

    return NextResponse.redirect(errorUrl.toString());
  }
}
