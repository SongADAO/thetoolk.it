import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";

interface InstagramTokenResponse {
  access_token: string;
  expires_in: number;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ?? ""),
  clientSecret: String(process.env.INSTAGRAM_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = [
  "instagram_business_basic",
  "instagram_business_content_publish",
];

const OAUTH_STATE = "instagram_auth";

// 5 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

// 30 days
const REFRESH_TOKEN_BUFFER_SECONDS = 30 * 24 * 60 * 60;

// -----------------------------------------------------------------------------

function needsAccessTokenRenewal(authorization: OauthExpiration): boolean {
  if (!authorization.accessTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    authorization.accessTokenExpiresAt,
    ACCESS_TOKEN_BUFFER_SECONDS,
  );
}

function needsRefreshTokenRenewal(authorization: OauthExpiration): boolean {
  if (!authorization.refreshTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    authorization.refreshTokenExpiresAt,
    REFRESH_TOKEN_BUFFER_SECONDS,
  );
}

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: OauthCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: OauthCredentials): boolean {
  return credentials.clientId !== "" && credentials.clientSecret !== "";
}

function hasCompleteAuthorization(authorization: OauthExpiration): boolean {
  return (
    authorization.refreshTokenExpiresAt !== "" &&
    !needsRefreshTokenRenewal(authorization)
  );
}

function getAuthorizationExpiresAt(authorization: OauthExpiration): string {
  return authorization.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

function getRedirectUriHosted(): string {
  const url = new URL(window.location.href);

  return `${url.origin}/api/hosted/oauth/callback`;
}

function getRedirectUri(): string {
  const url = new URL(window.location.href);

  return `${url.origin}/authorize`;
}

function shouldHandleAuthRedirect(searchParams: URLSearchParams): boolean {
  return Boolean(
    searchParams.get("code") &&
      searchParams.get("state")?.includes(OAUTH_STATE),
  );
}

function formatTokens(tokens: InstagramTokenResponse): OauthAuthorization {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.access_token,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatExpiration(tokens: InstagramTokenResponse): OauthExpiration {
  // Tokens have a 10 minutes lifespan (TODO: verify expiration)
  const expiresIn = 10 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 60-day lifespan
  const refreshExpiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  // Access tokens are the same as the refresh token.

  return {
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

function getAuthorizationUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: OAUTH_STATE,
  });

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  credentials: OauthCredentials,
  mode = "hosted",
): Promise<OauthAuthorizationAndExpiration> {
  const endpoint =
    mode === "hosted"
      ? "https://api.instagram.com/oauth/access_token"
      : "/api/instagram/oauth/access_token";

  const response = await fetch(endpoint, {
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await response.json();
  console.log(tokens);

  // Get long-lived token
  const longLivedParams = new URLSearchParams({
    access_token: tokens.access_token,
    client_secret: credentials.clientSecret,
    grant_type: "ig_exchange_token",
  });

  const longLivedTokenResponse = await fetch(
    `https://graph.instagram.com/v23.0/access_token?${longLivedParams.toString()}`,
  );

  if (!longLivedTokenResponse.ok) {
    const errorData = await longLivedTokenResponse.json();
    throw new Error(
      `Long lived token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const longLivedTokens = await longLivedTokenResponse.json();
  console.log(longLivedTokens);

  return {
    authorization: formatTokens(longLivedTokens),
    expiration: formatExpiration(longLivedTokens),
  };
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Starting Facebook authentication...");

  const response = await fetch("/api/hosted/oauth/refresh", {
    body: JSON.stringify({ serviceId: "instagram" }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  return await response.json();
}

// Refresh access token using refresh token
async function refreshAccessToken(
  authorization: OauthAuthorization,
): Promise<OauthAuthorizationAndExpiration> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    access_token: authorization.refreshToken,
    grant_type: "ig_refresh_token",
  });

  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?${params.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await response.json();
  console.log(tokens);

  return {
    authorization: formatTokens(tokens),
    expiration: formatExpiration(tokens),
  };
}

// -----------------------------------------------------------------------------

async function getUserInfo(token: string): Promise<ServiceAccount> {
  console.log(`Checking Threads user info`);

  const params = new URLSearchParams({
    access_token: token,
    fields: "id,username",
  });

  const response = await fetch(
    `https://graph.instagram.com/v23.0/me?${params.toString()}`,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  const userInfo = await response.json();
  console.log("Threads user info:", userInfo);

  return {
    id: userInfo.id,
    username: userInfo.username,
  };
}

async function getAccounts(token: string): Promise<ServiceAccount[]> {
  const accounts = [];

  const account = await getUserInfo(token);

  accounts.push(account);

  return accounts;
}

// -----------------------------------------------------------------------------

export {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  getRedirectUriHosted,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
};
