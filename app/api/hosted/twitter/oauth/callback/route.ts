import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateServiceAuthorizationAndAccounts } from "@/lib/supabase/service";
import { getBaseUrl, getOauthUrls } from "@/services/post/hosted";
import {
  exchangeCodeForTokens,
  getAccounts,
  HOSTED_CREDENTIALS,
} from "@/services/post/twitter/auth";

export async function GET(request: NextRequest) {
  const serviceId = "twitter";
  const oauthUrls = getOauthUrls();

  try {
    const serverAuth = await initServerAuth();

    const { searchParams } = new URL(request.url);

    const redirectUri = `${getBaseUrl()}/api/hosted/twitter/oauth/callback`;

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

    const accounts = await getAccounts(authorization.authorization.accessToken);

    await updateServiceAuthorizationAndAccounts({
      ...serverAuth,
      serviceAccounts: accounts,
      serviceAuthorization: authorization.authorization,
      serviceExpiration: authorization.expiration,
      serviceId,
    });

    // Redirect back to the application
    oauthUrls.success.searchParams.set("service", serviceId);
    oauthUrls.success.searchParams.set("auth", "success");

    return NextResponse.redirect(oauthUrls.success.toString());
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    // Redirect to app with error
    oauthUrls.error.searchParams.set("service", serviceId);
    oauthUrls.error.searchParams.set("error", "callback_failed");
    oauthUrls.error.searchParams.set("error_description", errMessage);

    return NextResponse.redirect(oauthUrls.error.toString());
  }
}
