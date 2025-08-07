import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateServiceAuthorizationAndAccounts } from "@/lib/supabase/service";
import {
  exchangeCodeForTokens,
  getAccounts,
  HOSTED_CREDENTIALS,
} from "@/services/post/twitter/auth";

export async function GET(request: NextRequest) {
  const serviceId = "twitter";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const successUrl = new URL(`${baseUrl}/authorize-success`);
  const errorUrl = new URL(`${baseUrl}/authorize-error`);

  try {
    const serverAuth = await initServerAuth();

    const { searchParams } = new URL(request.url);

    const redirectUri = `${baseUrl}/api/hosted/twitter/oauth/callback`;

    const { data: stateData, error: stateError } = await serverAuth.supabase
      .from("atproto_oauth_states")
      .select("value, expires_at")
      .eq("user_id", serverAuth.user.id)
      .eq("key", "twitter_code_verifier")
      .single();

    if (stateError) {
      throw new Error("Failed to get code verifier");
    }

    // Delete the retrieved code verifier
    await serverAuth.supabase
      .from("atproto_oauth_states")
      .delete()
      .eq("user_id", serverAuth.user.id)
      .eq("key", "twitter_code_verifier");

    if (!stateData.value.codeVerifier) {
      throw new Error(
        "Code verifier not found. Please restart the authorization process.",
      );
    }

    // Check if expired
    if (new Date(stateData.expires_at) < new Date()) {
      throw new Error(
        "Code verifier expired. Please restart the authorization process.",
      );
    }

    const authorization = await exchangeCodeForTokens(
      searchParams.get("code") ?? "",
      redirectUri,
      stateData.value.codeVerifier,
      HOSTED_CREDENTIALS,
    );

    const accounts = await getAccounts(
      // HOSTED_CREDENTIALS,
      authorization.accessToken,
    );

    await updateServiceAuthorizationAndAccounts({
      ...serverAuth,
      serviceAccounts: accounts,
      serviceAuthorization: authorization,
      serviceId,
    });

    // Redirect back to the application
    successUrl.searchParams.set("service", serviceId);
    successUrl.searchParams.set("auth", "success");

    return NextResponse.redirect(successUrl.toString());
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    // Redirect to app with error
    errorUrl.searchParams.set("service", serviceId);
    errorUrl.searchParams.set("error", "callback_failed");
    errorUrl.searchParams.set("error_description", errMessage);

    return NextResponse.redirect(errorUrl.toString());
  }
}
