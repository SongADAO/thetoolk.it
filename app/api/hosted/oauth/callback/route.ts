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
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_INSTAGRAM,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectInstagram,
} from "@/services/post/instagram/auth";
// import {
//   exchangeCodeForTokens as exchangeCodeForTokensInstagramfb,
//   getAccounts as getAccountsInstagramfb,
//   HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_INSTAGRAMFB,
//   shouldHandleAuthRedirect as shouldHandleAuthRedirectInstagramfb,
// } from "@/services/post/instagramfb/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensThreads,
  getAccounts as getAccountsThreads,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_THREADS,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectThreads,
} from "@/services/post/threads/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensTiktok,
  getAccounts as getAccountsTiktok,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TIKTOK,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectTiktok,
} from "@/services/post/tiktok/auth";
import type { OauthAuthorization, ServiceAccount } from "@/services/post/types";
import {
  exchangeCodeForTokens as exchangeCodeForTokensYoutube,
  getAccounts as getAccountsYoutube,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_YOUTUBE,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectYoutube,
} from "@/services/post/youtube/auth";

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
      HOSTED_CREDENTIALS_INSTAGRAM,
    );
  }

  // if (shouldHandleAuthRedirectInstagram(searchParams)) {
  //   return await exchangeCodeForTokensInstagramfb(
  //     searchParams.get("code") ?? "",
  //     redirectUri,
  //     HOSTED_CREDENTIALS_INSTAGRAMFB,
  //   );
  // }

  if (shouldHandleAuthRedirectThreads(searchParams)) {
    return await exchangeCodeForTokensThreads(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_THREADS,
    );
  }

  if (shouldHandleAuthRedirectTiktok(searchParams)) {
    return await exchangeCodeForTokensTiktok(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_TIKTOK,
    );
  }

  if (shouldHandleAuthRedirectYoutube(searchParams)) {
    return await exchangeCodeForTokensYoutube(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_YOUTUBE,
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

  // if (shouldHandleAuthRedirectInstagramfb(searchParams)) {
  //   return await getAccountsInstagramfb(
  //     // HOSTED_CREDENTIALS_INSTAGRAM,
  //     authorization.accessToken,
  //   );
  // }

  if (shouldHandleAuthRedirectThreads(searchParams)) {
    return await getAccountsThreads(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  if (shouldHandleAuthRedirectTiktok(searchParams)) {
    return await getAccountsTiktok(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  if (shouldHandleAuthRedirectYoutube(searchParams)) {
    return await getAccountsYoutube(
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

    const authorization = await exchangeCodeForTokens(
      searchParams,
      redirectUri,
    );

    const accounts = await getAccounts(searchParams, authorization);

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
