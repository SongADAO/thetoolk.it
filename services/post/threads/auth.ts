import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/services/post/types";

interface ThreadsTokenResponse {
  access_token: string;
  expires_in: number;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_THREADS_CLIENT_ID ?? ""),
  clientSecret: String(process.env.THREADS_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = ["threads_basic", "threads_content_publish"];

const OAUTH_STATE = "threads_auth";

// 5 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

// 30 days
const REFRESH_TOKEN_BUFFER_SECONDS = 30 * 24 * 60 * 60;

// -----------------------------------------------------------------------------

function needsAccessTokenRenewal(authorization: OauthAuthorization): boolean {
  if (!authorization.accessTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    authorization.accessTokenExpiresAt,
    ACCESS_TOKEN_BUFFER_SECONDS,
  );
}

function needsRefreshTokenRenewal(authorization: OauthAuthorization): boolean {
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

function hasCompleteAuthorization(authorization: OauthAuthorization): boolean {
  return (
    authorization.refreshTokenExpiresAt !== "" &&
    !needsRefreshTokenRenewal(authorization)
  );
}

function getAuthorizationExpiresAt(authorization: OauthAuthorization): string {
  return authorization.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

function getRedirectUriHosted(): string {
  const url = new URL(window.location.href);

  return `${url.origin}/api/hosted/oauth/authorize`;
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

function formatTokens(tokens: ThreadsTokenResponse): OauthAuthorization {
  // Tokens have a 10 minutes lifespan (TODO: verify expiration)
  const expiresIn = 10 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 60-day lifespan
  const refreshExpiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  // Access tokens are the same as the refresh token.

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.access_token,
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

  return `https://threads.net/oauth/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  credentials: OauthCredentials,
): Promise<OauthAuthorization> {
  const response = await fetch("https://graph.threads.net/oauth/access_token", {
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
    grant_type: "th_exchange_token",
  });

  const longLivedTokenResponse = await fetch(
    `https://graph.threads.net/access_token?${longLivedParams.toString()}`,
  );

  if (!longLivedTokenResponse.ok) {
    const errorData = await longLivedTokenResponse.json();
    throw new Error(
      `Long lived token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const longLivedTokens = await longLivedTokenResponse.json();
  console.log(longLivedTokens);

  return formatTokens(longLivedTokens);
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Starting Facebook authentication...");

  const response = await fetch("/api/hosted/threads/refresh-tokens", {
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
): Promise<OauthAuthorization> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    access_token: authorization.refreshToken,
    grant_type: "th_refresh_token",
  });

  const response = await fetch(
    `https://graph.threads.net/refresh_access_token?${params.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await response.json();
  console.log(tokens);

  return formatTokens(tokens);
}

// -----------------------------------------------------------------------------

async function getUserInfo(token: string): Promise<ServiceAccount> {
  console.log(`Checking Threads user info`);

  const params = new URLSearchParams({
    access_token: token,
    fields: "id,username",
  });

  const response = await fetch(
    `https://graph.threads.net/v1.0/me?${params.toString()}`,
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
