import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

function getServiceId(searchParams: URLSearchParams): string {
  if (shouldHandleAuthRedirectFacebook(searchParams)) {
    return "facebook";
  }

  if (shouldHandleAuthRedirectInstagram(searchParams)) {
    return "instagram";
  }

  if (shouldHandleAuthRedirectInstagram(searchParams)) {
    return "instagramfb";
  }

  if (shouldHandleAuthRedirectThreads(searchParams)) {
    return "threads";
  }

  if (shouldHandleAuthRedirectTiktok(searchParams)) {
    return "tiktok";
  }

  if (shouldHandleAuthRedirectYoutube(searchParams)) {
    return "youtube";
  }

  throw new Error("Unsupported service");
}

async function exchangeCodeForTokens(
  serviceId: string,
  searchParams: URLSearchParams,
  redirectUri: string,
): Promise<OauthAuthorization> {
  if (serviceId === "facebook") {
    console.log("Handling Facebook auth redirect");
    return await exchangeCodeForTokensFacebook(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_FACEBOOK,
    );
  }

  if (serviceId === "instagram") {
    console.log("Handling Instagram auth redirect");
    return await exchangeCodeForTokensInstagram(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_INSTAGRAM,
    );
  }

  // if (serviceId === "instagramfb") {
  //   console.log("Handling Instagram FB auth redirect");
  //   return await exchangeCodeForTokensInstagramfb(
  //     searchParams.get("code") ?? "",
  //     redirectUri,
  //     HOSTED_CREDENTIALS_INSTAGRAMFB,
  //   );
  // }

  if (serviceId === "threads") {
    console.log("Handling Threads auth redirect");
    return await exchangeCodeForTokensThreads(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_THREADS,
    );
  }

  if (serviceId === "tiktok") {
    console.log("Handling TikTok auth redirect");
    return await exchangeCodeForTokensTiktok(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_TIKTOK,
    );
  }

  if (serviceId === "youtube") {
    console.log("Handling YouTube auth redirect");
    return await exchangeCodeForTokensYoutube(
      searchParams.get("code") ?? "",
      redirectUri,
      HOSTED_CREDENTIALS_YOUTUBE,
    );
  }

  throw new Error("Unsupported service");
}

async function getAccounts(
  serviceId: string,
  authorization: OauthAuthorization,
): Promise<ServiceAccount[]> {
  if (serviceId === "facebook") {
    console.log("Getting Facebook accounts");
    return await getAccountsFacebook(
      // HOSTED_CREDENTIALS_FACEBOOK,
      authorization.accessToken,
    );
  }

  if (serviceId === "instagram") {
    console.log("Getting Instagram accounts");
    return await getAccountsInstagram(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  // if (serviceId === "instagramfb") {
  //   console.log("Getting Instagram FB accounts");
  //   return await getAccountsInstagramfb(
  //     // HOSTED_CREDENTIALS_INSTAGRAM,
  //     authorization.accessToken,
  //   );
  // }

  if (serviceId === "threads") {
    console.log("Getting Threads accounts");
    return await getAccountsThreads(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  if (serviceId === "tiktok") {
    console.log("Getting TikTok accounts");
    return await getAccountsTiktok(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  if (serviceId === "youtube") {
    console.log("Getting YouTube accounts");
    return await getAccountsYoutube(
      // HOSTED_CREDENTIALS_INSTAGRAM,
      authorization.accessToken,
    );
  }

  throw new Error("Unsupported service");
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const successUrl = new URL(`${baseUrl}/authorize-success`);
  const errorUrl = new URL(`${baseUrl}/authorize-error`);
  let serviceId = "unknown";

  try {
    const { searchParams } = new URL(request.url);

    const supabase = await createClient();

    const user = await getUser(supabase);

    const redirectUri = `${baseUrl}/api/hosted/oauth/callback`;

    serviceId = getServiceId(searchParams);

    const authorization = await exchangeCodeForTokens(
      serviceId,
      searchParams,
      redirectUri,
    );

    const accounts = await getAccounts(serviceId, authorization);

    const { error } = await supabase.from("services").upsert(
      {
        service_accounts: accounts,
        service_authorization: authorization,
        service_id: serviceId,
        user_id: user.id,
      },
      {
        onConflict: "user_id,service_id",
      },
    );

    if (error) {
      throw new Error("Could not get accounts");
    }

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
