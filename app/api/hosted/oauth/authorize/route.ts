import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens as exchangeCodeForTokensFacebook,
  getAccounts as getAccountsFacebook,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_FACEBOOK,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectFacebook,
} from "@/services/post/facebook/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensInstagram,
  getAccounts as getAccountsInstagram,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectInstagram,
} from "@/services/post/instagram/auth";
import type { OauthAuthorization, ServiceAccount } from "@/services/post/types";

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

async function exchangeCodeForTokens(
  searchParams: URLSearchParams,
  redirectUri: string,
): Promise<OauthAuthorization> {
  if (shouldHandleAuthRedirectFacebook(searchParams)) {
    return await exchangeCodeForTokensFacebook(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_FACEBOOK,
    );
  }

  if (shouldHandleAuthRedirectInstagram(searchParams)) {
    return await exchangeCodeForTokensInstagram(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_FACEBOOK,
    );
  }

  throw new Error("Unsupported service");
}

async function getAccounts(
  searchParams: URLSearchParams,
  authorization: OauthAuthorization,
): Promise<ServiceAccount[]> {
  if (shouldHandleAuthRedirectFacebook(searchParams)) {
    return await getAccountsFacebook(
      // HOSTED_CREDENTIALS_FACEBOOK,
      authorization.accessToken,
    );
  }

  if (shouldHandleAuthRedirectInstagram(searchParams)) {
    return await getAccountsInstagram(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  throw new Error("Unsupported service");
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const supabase = await createClient();

    const user = await getUser(supabase);

    const redirectUri = "";

    const newAuthorization = await exchangeCodeForTokens(
      searchParams,
      redirectUri,
    );

    const accounts = await getAccounts(searchParams, newAuthorization);

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
