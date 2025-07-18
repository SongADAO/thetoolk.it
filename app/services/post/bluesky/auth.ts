import { objectIdHash } from "@/app/lib/hash";
import { hasExpired } from "@/app/services/post/helpers";
import type {
  BlueskyCredentials,
  OauthAuthorization,
  ServiceAccount,
} from "@/app/services/post/types";

interface BlueskyTokenResponse {
  accessJwt: string;
  refreshJwt: string;
}

// -----------------------------------------------------------------------------

// 5 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

// 30 days
const REFRESH_TOKEN_BUFFER_SECONDS = 30 * 24 * 60 * 60;

// -----------------------------------------------------------------------------

function needsAccessTokenRenewal(authorization: OauthAuthorization): boolean {
  if (!authorization.accessToken || !authorization.accessTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    authorization.accessTokenExpiresAt,
    ACCESS_TOKEN_BUFFER_SECONDS,
  );
}

function needsRefreshTokenRenewal(authorization: OauthAuthorization): boolean {
  if (!authorization.refreshToken || !authorization.refreshTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    authorization.refreshTokenExpiresAt,
    REFRESH_TOKEN_BUFFER_SECONDS,
  );
}

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: BlueskyCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: BlueskyCredentials): boolean {
  return (
    credentials.appPassword !== "" &&
    credentials.serviceUrl !== "" &&
    credentials.username !== ""
  );
}

function hasCompleteAuthorization(authorization: OauthAuthorization): boolean {
  return (
    authorization.refreshToken !== "" &&
    authorization.refreshTokenExpiresAt !== "" &&
    !needsRefreshTokenRenewal(authorization)
  );
}

function getAuthorizationExpiresAt(authorization: OauthAuthorization): string {
  return authorization.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

function formatTokens(tokens: BlueskyTokenResponse): OauthAuthorization {
  // Tokens have a 10 minutes lifespan (TODO: verify expiration)
  const expiresIn = 10 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 60-day lifespan
  const refreshExpiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  return {
    accessToken: tokens.accessJwt,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.refreshJwt,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

async function exchangeCodeForTokens(
  credentials: BlueskyCredentials,
): Promise<OauthAuthorization> {
  console.log("Starting Bluesky authentication...");

  const response = await fetch(
    `${credentials.serviceUrl}/xrpc/com.atproto.server.createSession`,
    {
      body: JSON.stringify({
        identifier: credentials.username,
        password: credentials.appPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Authentication failed: ${errorData.message ?? errorData.error}`,
    );
  }

  const sessionData = await response.json();
  console.log("Session data:", sessionData);

  return formatTokens(sessionData);
}

// Refresh access token using refresh token
async function refreshAccessToken(
  credentials: BlueskyCredentials,
  authorization: OauthAuthorization,
): Promise<OauthAuthorization> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(
    `${credentials.serviceUrl}/xrpc/com.atproto.server.refreshSession`,
    {
      headers: {
        Authorization: `Bearer ${authorization.refreshToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const sessionData = await response.json();
  console.log("Session data:", sessionData);

  return formatTokens(sessionData);
}

// -----------------------------------------------------------------------------

async function getAccounts(
  serviceUrl: string,
  username: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  token: string,
): Promise<ServiceAccount[]> {
  const accounts = [];

  accounts.push({
    accessToken: "",
    id: serviceUrl,
    username,
  });

  return Promise.resolve(accounts);
}

// -----------------------------------------------------------------------------

export {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
};
