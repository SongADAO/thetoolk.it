import { POST_CONFIGS } from "@/services/post/configs";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthExpiration,
  PostServiceAccount,
} from "@/services/post/types";

function getAuthRedirectServiceId(requestUrl: string): string {
  const { searchParams } = new URL(requestUrl);

  for (const { config, id } of POST_CONFIGS) {
    if (config.authModule.shouldHandleAuthCallback(searchParams)) {
      return id;
    }
  }

  throw new Error("Unsupported service");
}

function getServiceConfig(serviceId: string): ServiceConfig {
  const serviceConfig = POST_CONFIGS.find(
    (config) => config.id === serviceId,
  )?.config;

  if (!serviceConfig) {
    throw new Error(`Unsupported service: ${serviceId}`);
  }

  return serviceConfig;
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
