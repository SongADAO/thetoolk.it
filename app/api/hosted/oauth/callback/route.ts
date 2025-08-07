import { NextRequest, NextResponse } from "next/server";

import { initServerAuth } from "@/lib/supabase/hosted-api";
import { updateServiceAuthorizationAndAccounts } from "@/lib/supabase/service";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthRedirectServiceId,
} from "@/services/post/hosted";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const successUrl = new URL(`${baseUrl}/authorize-success`);
  const errorUrl = new URL(`${baseUrl}/authorize-error`);
  let serviceId = "unknown";

  try {
    const serverAuth = await initServerAuth();

    const { searchParams } = new URL(request.url);

    const redirectUri = `${baseUrl}/api/hosted/oauth/callback`;

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
