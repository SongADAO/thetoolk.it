import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateServiceAuthorizationAndAccounts } from "@/lib/supabase/service";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthRedirectServiceId,
  getBaseUrlFromRequest,
  getOauthUrls,
} from "@/services/post/hosted";

export async function GET(request: NextRequest) {
  let serviceId = "unknown";
  const oauthUrls = getOauthUrls(getBaseUrlFromRequest(request));

  try {
    const serverAuth = await initServerAuth();

    const { searchParams } = new URL(request.url);

    serviceId = getAuthRedirectServiceId(searchParams);

    const url = new URL(getBaseUrlFromRequest(request));
    const redirectUri = `${url.protocol}//${url.host}/api/hosted/oauth/callback`;

    const { data: stateData, error: stateError } =
      await serverAuth.supabaseAdmin
        .from("service_oauth_states")
        .select("value, expires_at")
        .eq("user_id", serverAuth.user.id)
        .eq("key", `${serviceId}_code_verifier`)
        .single();

    if (stateError) {
      throw new Error("Failed to get code verifier");
    }

    // Delete the retrieved code verifier
    await serverAuth.supabaseAdmin
      .from("service_oauth_states")
      .delete()
      .eq("user_id", serverAuth.user.id)
      .eq("key", `${serviceId}_code_verifier`);

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
      serviceId,
      searchParams,
      redirectUri,
      stateData.value.codeVerifier,
    );

    const accounts = await getAccounts(serviceId, authorization.authorization);

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
  } catch (err: unknown) {
    console.error("OAuth callback error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";

    // Redirect to app with error
    oauthUrls.error.searchParams.set("service", serviceId);
    oauthUrls.error.searchParams.set("error", "callback_failed");
    oauthUrls.error.searchParams.set("error_description", errMessage);

    return NextResponse.redirect(oauthUrls.error.toString());
  }
}
