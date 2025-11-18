import { facebookServiceConfig } from "@/services/post/facebook/ServiceConfig";
import { instagramServiceConfig } from "@/services/post/instagram/ServiceConfig";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import { threadsServiceConfig } from "@/services/post/threads/ServiceConfig";
import { tiktokServiceConfig } from "@/services/post/tiktok/ServiceConfig";
import { twitterServiceConfig } from "@/services/post/twitter/ServiceConfig";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthExpiration,
  PostServiceAccount,
} from "@/services/post/types";
import { youtubeServiceConfig } from "@/services/post/youtube/ServiceConfig";

function getAuthRedirectServiceId(requestUrl: string): string {
  const { searchParams } = new URL(requestUrl);

  if (facebookServiceConfig.authModule.shouldHandleAuthCallback(searchParams)) {
    return facebookServiceConfig.id;
  }

  if (
    instagramServiceConfig.authModule.shouldHandleAuthCallback(searchParams)
  ) {
    return instagramServiceConfig.id;
  }

  if (threadsServiceConfig.authModule.shouldHandleAuthCallback(searchParams)) {
    return threadsServiceConfig.id;
  }

  if (tiktokServiceConfig.authModule.shouldHandleAuthCallback(searchParams)) {
    return tiktokServiceConfig.id;
  }

  if (youtubeServiceConfig.authModule.shouldHandleAuthCallback(searchParams)) {
    return youtubeServiceConfig.id;
  }

  if (twitterServiceConfig.authModule.shouldHandleAuthCallback(searchParams)) {
    return twitterServiceConfig.id;
  }

  throw new Error("Unsupported service");
}

function getServiceConfig(serviceId: string): ServiceConfig {
  switch (serviceId) {
    case "facebook":
      return facebookServiceConfig;
    case "instagram":
      return instagramServiceConfig;
    case "threads":
      return threadsServiceConfig;
    case "tiktok":
      return tiktokServiceConfig;
    case "youtube":
      return youtubeServiceConfig;
    case "twitter":
      return twitterServiceConfig;
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
): Promise<PostServiceAccount[]> {
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
  getOauthUrls,
  refreshAccessToken,
};
