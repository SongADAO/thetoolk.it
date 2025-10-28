import { NextRequest } from "next/server";

import { facebookProviderConfig } from "@/services/post/facebook/providerConfig";
import { instagramProviderConfig } from "@/services/post/instagram/providerConfig";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import { threadsProviderConfig } from "@/services/post/threads/providerConfig";
import { tiktokProviderConfig } from "@/services/post/tiktok/providerConfig";
import { twitterProviderConfig } from "@/services/post/twitter/providerConfig";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";
import { youtubeProviderConfig } from "@/services/post/youtube/providerConfig";

function getAuthRedirectServiceId(searchParams: URLSearchParams): string {
  if (
    facebookProviderConfig.authModule.shouldHandleAuthRedirect(searchParams)
  ) {
    return "facebook";
  }

  if (
    instagramProviderConfig.authModule.shouldHandleAuthRedirect(searchParams)
  ) {
    return "instagram";
  }

  if (threadsProviderConfig.authModule.shouldHandleAuthRedirect(searchParams)) {
    return "threads";
  }

  if (tiktokProviderConfig.authModule.shouldHandleAuthRedirect(searchParams)) {
    return "tiktok";
  }

  if (youtubeProviderConfig.authModule.shouldHandleAuthRedirect(searchParams)) {
    return "youtube";
  }

  if (twitterProviderConfig.authModule.shouldHandleAuthRedirect(searchParams)) {
    return "twitter";
  }

  throw new Error("Unsupported service");
}

function getServiceConfig(serviceId: string): ServiceConfig {
  switch (serviceId) {
    case "facebook":
      return facebookProviderConfig;
    case "instagram":
      return instagramProviderConfig;
    case "threads":
      return threadsProviderConfig;
    case "tiktok":
      return tiktokProviderConfig;
    case "youtube":
      return youtubeProviderConfig;
    case "twitter":
      return twitterProviderConfig;
    default:
      throw new Error("Unsupported service");
  }
}

function getAuthorizeUrl(
  serviceId: string,
  redirectUri: string,
  codeChallenge: string,
): string {
  console.log(`Get ${serviceId} auth URL`);

  const serviceConfig = getServiceConfig(serviceId);

  return serviceConfig.authModule.getAuthorizeUrl(
    serviceConfig.authModule.HOSTED_CREDENTIALS,
    redirectUri,
    codeChallenge,
  );
}

async function exchangeCodeForTokens(
  serviceId: string,
  searchParams: URLSearchParams,
  redirectUri: string,
  codeVerifier: string,
): Promise<OauthAuthorizationAndExpiration> {
  console.log(`Handling ${serviceId} auth redirect`);

  const serviceConfig = getServiceConfig(serviceId);

  return await serviceConfig.authModule.exchangeCodeForTokens(
    searchParams.get("code") ?? "",
    searchParams.get("iss") ?? "",
    searchParams.get("state") ?? "",
    redirectUri,
    codeVerifier,
    serviceConfig.authModule.HOSTED_CREDENTIALS,
    "",
    "hosted",
  );
}

async function getAccounts(
  serviceId: string,
  authorization: OauthAuthorization,
): Promise<ServiceAccount[]> {
  console.log(`Getting ${serviceId} accounts`);

  const serviceConfig = getServiceConfig(serviceId);

  return await serviceConfig.authModule.getAccounts(
    serviceConfig.authModule.HOSTED_CREDENTIALS,
    authorization.accessToken,
    "",
    "hosted",
  );
}

async function refreshAccessToken(
  serviceId: string,
  authorization: OauthAuthorization,
  expiration: OauthExpiration,
): Promise<OauthAuthorizationAndExpiration> {
  console.log(`Refreshing ${serviceId} tokens`);

  const serviceConfig = getServiceConfig(serviceId);

  return await serviceConfig.authModule.refreshAccessToken(
    authorization,
    serviceConfig.authModule.HOSTED_CREDENTIALS,
    expiration,
    "",
    "hosted",
  );
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
