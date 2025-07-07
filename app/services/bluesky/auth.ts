import type {
  BlueskyCredentials,
  OauthAuthorization,
  ServiceAccount,
} from "@/app/services/types";

interface BlueskyTokenResponse {
  accessJwt: string;
  expires_in: number;
  refreshJwt: string;
  refresh_token_expires_in: number;
}

interface BlueskyPage {
  id: string;
  name: string;
  access_token: string;
}

function formatTokens(tokens: BlueskyTokenResponse) {
  const expiresIn = 5184000000;
  // const expiresIn = tokens.expires_in * 1000;

  // Calculate expiry time
  const expiryTime = new Date(Date.now() + expiresIn);

  // const refreshExpiryTime = new Date(
  //   Date.now() + tokens.refresh_token_expires_in * 1000,
  // );

  return {
    accessToken: tokens.accessJwt,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.refreshJwt,
    refreshTokenExpiresAt: expiryTime.toISOString(),
    // refreshToken: tokens.refresh_token,
    // refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

async function exchangeCodeForTokens(
  appPassword: string,
  serviceUrl: string,
  username: string,
) {
  console.log("Starting Bluesky authentication...");

  const response = await fetch(
    `${serviceUrl}/xrpc/com.atproto.server.createSession`,
    {
      body: JSON.stringify({
        identifier: username,
        password: appPassword,
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
  serviceUrl: string,
  authorization: OauthAuthorization,
) {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(
    `${serviceUrl}/xrpc/com.atproto.server.refreshSession`,
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

function hasTokenExpired(tokenExpiry: string | null) {
  if (!tokenExpiry) {
    return false;
  }

  const tokenExpiryDate = new Date(tokenExpiry);

  // Check if token is expired or about to expire (5 minutes buffer)
  const now = new Date();

  // 5 minutes in milliseconds
  const bufferTime = 5 * 60 * 1000;

  return now.getTime() > tokenExpiryDate.getTime() - bufferTime;
}

function needsTokenRefresh(tokenExpiry: string | null) {
  if (!tokenExpiry) {
    return false;
  }

  const tokenExpiryDate = new Date(tokenExpiry);

  // Check if token is expired or about to expire (5 minutes buffer)
  const now = new Date();

  // 30 days in milliseconds
  const bufferTime = 30 * 24 * 60 * 60 * 1000;

  return now.getTime() > tokenExpiryDate.getTime() - bufferTime;
}

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

// Get Bluesky Accounts from Bluesky Pages
// eslint-disable-next-line @typescript-eslint/require-await
async function getBlueskyAccounts(
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

export {
  exchangeCodeForTokens,
  getAuthorizationExpiresAt,
  getBlueskyAccounts,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  needsTokenRefresh,
  refreshAccessToken,
};
