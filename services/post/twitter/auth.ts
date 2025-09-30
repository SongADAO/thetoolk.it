import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";

interface TwitterTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID ?? ""),
  clientSecret: String(process.env.TWITTER_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
  "media.write",
];

const OAUTH_STATE = "twitter_auth";

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

  return `${url.origin}/api/hosted/twitter/oauth/callback`;
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

function formatTokens(tokens: TwitterTokenResponse): OauthAuthorization {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

function formatExpiration(tokens: TwitterTokenResponse): OauthExpiration {
  const expiresIn = tokens.expires_in * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh Tokens have a 6-month lifespan.
  const refreshExpiresIn = 180 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  return {
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

function getTwitterAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    state: OAUTH_STATE,
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

async function getAuthorizationUrlHosted(): Promise<string> {
  try {
    console.log("Starting OAuth flow for Twitter");

    const response = await fetch("/api/hosted/twitter/oauth/authorize", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error ?? "Failed to get authorization URL");
    }

    console.log("Authorization URL received from server");

    return result.authUrl;
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth URL failed";
    console.error("Error creating authorization URL:", err);
    throw new Error(`Failed to create authorization URL: ${errMessage}`);
  }
}

async function getAuthorizationUrl(
  clientId: string,
  redirectUri: string,
): Promise<string> {
  console.log("Starting Twitter authorization...");

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();

  // Store code verifier for later use
  localStorage.setItem("thetoolkit_twitter_code_verifier", codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return getTwitterAuthorizeUrl(clientId, redirectUri, codeChallenge);
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  credentials: OauthCredentials,
  mode = "hosted",
): Promise<OauthAuthorization> {
  const endpoint =
    mode === "hosted"
      ? "https://api.twitter.com/2/oauth2/token"
      : "/api/twitter/2/oauth2/token";

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      client_id: credentials.clientId,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    headers: {
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Token exchange failed: ${errorData.error}`);
  }

  const tokens = await response.json();
  console.log(tokens);

  return formatTokens(tokens);
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Refreshing Twitter tokens...");

  const response = await fetch("/api/hosted/oauth/refresh", {
    body: JSON.stringify({ serviceId: "twitter" }),
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
  credentials: OauthCredentials,
  authorization: OauthAuthorization,
  mode = "hosted",
): Promise<OauthAuthorization> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const endpoint =
    mode === "hosted"
      ? "https://api.twitter.com/2/oauth2/token"
      : "/api/twitter/2/oauth2/token";

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      client_id: credentials.clientId,
      grant_type: "refresh_token",
      refresh_token: authorization.refreshToken,
    }),
    headers: {
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Token exchange failed: ${errorData.error}`);
  }

  const tokens = await response.json();
  console.log(tokens);

  return formatTokens(tokens);
}

// -----------------------------------------------------------------------------

async function getUserInfo(
  token: string,
  mode = "hosted",
): Promise<ServiceAccount> {
  console.log(`Checking Twitter user info`);

  const endpoint =
    mode === "hosted"
      ? "https://api.twitter.com/2/users/me"
      : "/api/twitter/2/users/me";

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get user info: ${error.error}`);
  }

  const userInfo = await response.json();
  console.log("Twitter user info:", userInfo);

  return {
    id: userInfo.data.id,
    username: userInfo.data.username,
  };
}

async function getAccounts(
  token: string,
  mode = "hosted",
): Promise<ServiceAccount[]> {
  const accounts = [];

  const account = await getUserInfo(token, mode);

  accounts.push(account);

  return accounts;
}

// -----------------------------------------------------------------------------

export {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getCredentialsId,
  getRedirectUri,
  getRedirectUriHosted,
  getTwitterAuthorizeUrl,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
};
