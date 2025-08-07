import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateServiceAuthorizationAndAccounts } from "@/lib/supabase/service";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthRedirectServiceId,
  getHostedBaseUrl,
  getOauthUrls,
} from "@/services/post/hosted";

export async function GET(request: NextRequest) {
  let serviceId = "unknown";
  const oauthUrls = getOauthUrls();

  try {
    const serverAuth = await initServerAuth();

    const { searchParams } = new URL(request.url);

    const redirectUri = `${getHostedBaseUrl()}/api/hosted/oauth/callback`;

    serviceId = getAuthRedirectServiceId(searchParams);

    const authorization = await exchangeCodeForTokens(
      serviceId,
      searchParams,
      redirectUri,
    );

    const accounts = await getAccounts(serviceId, authorization);

    await updateServiceAuthorizationAndAccounts({
      ...serverAuth,
      serviceAccounts: accounts,
      serviceAuthorization: authorization,
      serviceId,
    });

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
