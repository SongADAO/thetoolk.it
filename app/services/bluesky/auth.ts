import { hasExpired } from "@/app/services/helpers";
import type {
  BlueskyCredentials,
  OauthAuthorization,
  ServiceAccount,
} from "@/app/services/types";

interface BlueskyTokenResponse {
  accessJwt: string;
  refreshJwt: string;
}

// -----------------------------------------------------------------------------

function hasTokenExpired(tokenExpiry: string | null) {
  // 5 minutes buffer
  return hasExpired(tokenExpiry, 5 * 60);
}

function needsTokenRefresh(tokenExpiry: string | null) {
  // 30 day buffer
  return hasExpired(tokenExpiry, 30 * 24 * 60 * 60);
}

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: BlueskyCredentials) {
  return JSON.stringify(credentials);
}

function hasCompleteCredentials(credentials: BlueskyCredentials) {
  return (
    credentials.appPassword !== "" &&
    credentials.serviceUrl !== "" &&
    credentials.username !== ""
  );
}

function hasCompleteAuthorization(authorization: OauthAuthorization) {
  return (
    authorization.accessToken !== "" &&
    authorization.accessTokenExpiresAt !== "" &&
    authorization.refreshToken !== "" &&
    authorization.refreshTokenExpiresAt !== "" &&
    !hasTokenExpired(authorization.refreshTokenExpiresAt)
  );
}

function getAuthorizationExpiresAt(authorization: OauthAuthorization) {
  return authorization.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

function formatTokens(tokens: BlueskyTokenResponse) {
  // Tokens have a 60-day lifespan
  const expiresIn = 5184000000;

  // Calculate expiry time
  const expiryTime = new Date(Date.now() + expiresIn);

  return {
    accessToken: tokens.accessJwt,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.refreshJwt,
    refreshTokenExpiresAt: expiryTime.toISOString(),
  };
}

async function exchangeCodeForTokens(credentials: BlueskyCredentials) {
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
) {
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
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  const sessionData = await response.json();
  console.log("Session data:", sessionData);

  return formatTokens(sessionData);
}

// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/require-await
async function getAccounts(
  serviceUrl: string,
  username: string,
  token: string,
): Promise<ServiceAccount[]> {
  const accounts = [];

  accounts.push({
    accessToken: token,
    id: serviceUrl,
    username,
  });

  return accounts;
}

// -----------------------------------------------------------------------------

export {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  needsTokenRefresh,
  refreshAccessToken,
};
