import {
  exchangeCodeForTokens as exchangeCodeForTokensFacebook,
  getAccounts as getAccountsFacebook,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_FACEBOOK,
  refreshAccessToken as refreshAccessTokenFacebook,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectFacebook,
} from "@/services/post/facebook/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensInstagram,
  getAccounts as getAccountsInstagram,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_INSTAGRAM,
  refreshAccessToken as refreshAccessTokenInstagram,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectInstagram,
} from "@/services/post/instagram/auth";
// import {
//   exchangeCodeForTokens as exchangeCodeForTokensInstagramfb,
//   getAccounts as getAccountsInstagramfb,
//   HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_INSTAGRAMFB,
//   refreshAccessToken as refreshAccessTokenInstagramfb,
//   shouldHandleAuthRedirect as shouldHandleAuthRedirectInstagramfb,
// } from "@/services/post/instagramfb/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensThreads,
  getAccounts as getAccountsThreads,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_THREADS,
  refreshAccessToken as refreshAccessTokenThreads,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectThreads,
} from "@/services/post/threads/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensTiktok,
  getAccounts as getAccountsTiktok,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TIKTOK,
  refreshAccessToken as refreshAccessTokenTiktok,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectTiktok,
} from "@/services/post/tiktok/auth";
import type { OauthAuthorization, ServiceAccount } from "@/services/post/types";
import {
  exchangeCodeForTokens as exchangeCodeForTokensYoutube,
  getAccounts as getAccountsYoutube,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_YOUTUBE,
  refreshAccessToken as refreshAccessTokenYoutube,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectYoutube,
} from "@/services/post/youtube/auth";

function getAuthRedirectServiceId(searchParams: URLSearchParams): string {
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
    return await getAccountsFacebook(authorization.accessToken);
  }

  if (serviceId === "instagram") {
    console.log("Getting Instagram accounts");
    return await getAccountsInstagram(authorization.accessToken);
  }

  // if (serviceId === "instagramfb") {
  //   console.log("Getting Instagram FB accounts");
  //   return await getAccountsInstagramfb(
  //     authorization.accessToken,
  //   );
  // }

  if (serviceId === "threads") {
    console.log("Getting Threads accounts");
    return await getAccountsThreads(authorization.accessToken);
  }

  if (serviceId === "tiktok") {
    console.log("Getting TikTok accounts");
    return await getAccountsTiktok(authorization.accessToken);
  }

  if (serviceId === "youtube") {
    console.log("Getting YouTube accounts");
    return await getAccountsYoutube(authorization.accessToken);
  }

  throw new Error("Unsupported service");
}

async function refreshAccessToken(
  serviceId: string,
  authorization: OauthAuthorization,
): Promise<OauthAuthorization> {
  if (serviceId === "facebook") {
    console.log("Getting Facebook accounts");
    return await refreshAccessTokenFacebook(authorization);
  }

  if (serviceId === "instagram") {
    console.log("Getting Instagram accounts");
    return await refreshAccessTokenInstagram(authorization);
  }

  // if (serviceId === "instagramfb") {
  //   console.log("Getting Instagram FB accounts");
  //   return await refreshAccessTokenInstagramfb(authorization);
  // }

  if (serviceId === "threads") {
    console.log("Getting Threads accounts");
    return await refreshAccessTokenThreads(authorization);
  }

  if (serviceId === "tiktok") {
    console.log("Getting TikTok accounts");
    return await refreshAccessTokenTiktok(
      HOSTED_CREDENTIALS_TIKTOK,
      authorization,
    );
  }

  if (serviceId === "youtube") {
    console.log("Getting YouTube accounts");
    return await refreshAccessTokenYoutube(
      HOSTED_CREDENTIALS_YOUTUBE,
      authorization,
    );
  }

  throw new Error("Unsupported service");
}

export {
  exchangeCodeForTokens,
  getAccounts,
  getAuthRedirectServiceId,
  refreshAccessToken,
};
