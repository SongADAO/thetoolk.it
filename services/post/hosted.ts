import { NextRequest } from "next/server";

import {
  exchangeCodeForTokens as exchangeCodeForTokensFacebook,
  getAccounts as getAccountsFacebook,
  getAuthorizeUrl as getFacebookAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_FACEBOOK,
  refreshAccessToken as refreshAccessTokenFacebook,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectFacebook,
} from "@/services/post/facebook/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensInstagram,
  getAccounts as getAccountsInstagram,
  getAuthorizeUrl as getInstagramAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_INSTAGRAM,
  refreshAccessToken as refreshAccessTokenInstagram,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectInstagram,
} from "@/services/post/instagram/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensThreads,
  getAccounts as getAccountsThreads,
  getAuthorizeUrl as getThreadsAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_THREADS,
  refreshAccessToken as refreshAccessTokenThreads,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectThreads,
} from "@/services/post/threads/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensTiktok,
  getAccounts as getAccountsTiktok,
  getAuthorizeUrl as getTiktokAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TIKTOK,
  refreshAccessToken as refreshAccessTokenTiktok,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectTiktok,
} from "@/services/post/tiktok/auth";
import {
  exchangeCodeForTokens as exchangeCodeForTokensTwitter,
  getAccounts as getAccountsTwitter,
  getAuthorizeUrl as getTwitterAuthorizeUrl,
  HOSTED_CREDENTIALS as HOSTED_CREDENTIALS_TWITTER,
  refreshAccessToken as refreshAccessTokenTwitter,
  shouldHandleAuthRedirect as shouldHandleAuthRedirectTwitter,
} from "@/services/post/twitter/auth";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";
import {
  exchangeCodeForTokens as exchangeCodeForTokensYoutube,
  getAccounts as getAccountsYoutube,
  getAuthorizeUrl as getYoutubeAuthorizeUrl,
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

  if (shouldHandleAuthRedirectThreads(searchParams)) {
    return "threads";
  }

  if (shouldHandleAuthRedirectTiktok(searchParams)) {
    return "tiktok";
  }

  if (shouldHandleAuthRedirectYoutube(searchParams)) {
    return "youtube";
  }

  if (shouldHandleAuthRedirectTwitter(searchParams)) {
    return "twitter";
  }

  throw new Error("Unsupported service");
}

function getAuthorizeUrl(
  serviceId: string,
  redirectUri: string,
  codeChallenge: string,
): string {
  if (serviceId === "facebook") {
    console.log("Handling Facebook auth redirect");
    return getFacebookAuthorizeUrl(
      HOSTED_CREDENTIALS_FACEBOOK.clientId,
      redirectUri,
      codeChallenge,
    );
  }

  if (serviceId === "instagram") {
    console.log("Handling Instagram auth redirect");
    return getInstagramAuthorizeUrl(
      HOSTED_CREDENTIALS_INSTAGRAM.clientId,
      redirectUri,
      codeChallenge,
    );
  }

  if (serviceId === "threads") {
    console.log("Handling Threads auth redirect");
    return getThreadsAuthorizeUrl(
      HOSTED_CREDENTIALS_THREADS.clientId,
      redirectUri,
      codeChallenge,
    );
  }

  if (serviceId === "tiktok") {
    console.log("Handling TikTok auth redirect");
    return getTiktokAuthorizeUrl(
      HOSTED_CREDENTIALS_TIKTOK.clientId,
      redirectUri,
      codeChallenge,
    );
  }

  if (serviceId === "youtube") {
    console.log("Get YouTube auth URL");
    return getYoutubeAuthorizeUrl(
      HOSTED_CREDENTIALS_YOUTUBE.clientId,
      redirectUri,
      codeChallenge,
    );
  }

  if (serviceId === "twitter") {
    console.log("Get Twitter auth URL");
    return getTwitterAuthorizeUrl(
      HOSTED_CREDENTIALS_TWITTER.clientId,
      redirectUri,
      codeChallenge,
    );
  }

  throw new Error("Unsupported service");
}

async function exchangeCodeForTokens(
  serviceId: string,
  searchParams: URLSearchParams,
  redirectUri: string,
  codeVerifier: string,
): Promise<OauthAuthorizationAndExpiration> {
  if (serviceId === "facebook") {
    console.log("Handling Facebook auth redirect");
    return await exchangeCodeForTokensFacebook(
      searchParams.get("code") ?? "",
      searchParams.get("state") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS_FACEBOOK,
    );
  }

  if (serviceId === "instagram") {
    console.log("Handling Instagram auth redirect");
    return await exchangeCodeForTokensInstagram(
      searchParams.get("code") ?? "",
      searchParams.get("state") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS_INSTAGRAM,
    );
  }

  if (serviceId === "threads") {
    console.log("Handling Threads auth redirect");
    return await exchangeCodeForTokensThreads(
      searchParams.get("code") ?? "",
      searchParams.get("state") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS_THREADS,
    );
  }

  if (serviceId === "tiktok") {
    console.log("Handling TikTok auth redirect");
    return await exchangeCodeForTokensTiktok(
      searchParams.get("code") ?? "",
      searchParams.get("state") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS_TIKTOK,
    );
  }

  if (serviceId === "youtube") {
    console.log("Handling YouTube auth redirect");
    return await exchangeCodeForTokensYoutube(
      searchParams.get("code") ?? "",
      searchParams.get("state") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS_YOUTUBE,
    );
  }

  if (serviceId === "twitter") {
    console.log("Handling Twitter auth redirect");
    return await exchangeCodeForTokensTwitter(
      searchParams.get("code") ?? "",
      searchParams.get("state") ?? "",
      redirectUri,
      codeVerifier,
      HOSTED_CREDENTIALS_TWITTER,
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

  if (serviceId === "twitter") {
    console.log("Getting Twitter accounts");
    return await getAccountsTwitter(authorization.accessToken);
  }

  throw new Error("Unsupported service");
}

async function refreshAccessToken(
  serviceId: string,
  authorization: OauthAuthorization,
  expiration: OauthExpiration,
): Promise<OauthAuthorizationAndExpiration> {
  if (serviceId === "facebook") {
    console.log("Refreshing Facebook tokens");
    return await refreshAccessTokenFacebook(
      authorization,
      HOSTED_CREDENTIALS_FACEBOOK,
      expiration,
    );
  }

  if (serviceId === "instagram") {
    console.log("Refreshing Instagram tokens");
    return await refreshAccessTokenInstagram(
      authorization,
      HOSTED_CREDENTIALS_INSTAGRAM,
      expiration,
    );
  }

  if (serviceId === "threads") {
    console.log("Refreshing Threads tokens");
    return await refreshAccessTokenThreads(
      authorization,
      HOSTED_CREDENTIALS_THREADS,
      expiration,
    );
  }

  if (serviceId === "tiktok") {
    console.log("Refreshing TikTok tokens");
    return await refreshAccessTokenTiktok(
      authorization,
      HOSTED_CREDENTIALS_TIKTOK,
      expiration,
    );
  }

  if (serviceId === "twitter") {
    console.log("Refreshing Twitter tokens");
    return await refreshAccessTokenTwitter(
      authorization,
      HOSTED_CREDENTIALS_TWITTER,
      expiration,
    );
  }

  if (serviceId === "youtube") {
    console.log("Refreshing YouTube tokens");
    return await refreshAccessTokenYoutube(
      authorization,
      HOSTED_CREDENTIALS_YOUTUBE,
      expiration,
    );
  }

  throw new Error("Unsupported service");
}

function getBaseUrlFromRequest(request: NextRequest) {
  // Check for forwarded host (set by ngrok and other proxies)
  const forwardedHost = request.headers.get("x-forwarded-host");
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const host = forwardedHost || request.headers.get("host");

  // Check for forwarded protocol
  const forwardedProto = request.headers.get("x-forwarded-proto");
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const protocol = forwardedProto || "https";

  if (!host) {
    throw new Error("Host header is missing");
  }

  return `${protocol}://${host}`;
}

function getOauthUrls(requestUrl: string) {
  const url = new URL(requestUrl);
  const baseURL = `${url.protocol}//${url.host}`;

  const error = new URL(`${baseURL}/authorize-error`);
  const success = new URL(`${baseURL}/authorize-success`);

  return {
    error,
    success,
  };
}

export {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizeUrl,
  getAuthRedirectServiceId,
  getBaseUrlFromRequest,
  getOauthUrls,
  refreshAccessToken,
};
