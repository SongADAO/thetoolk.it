import { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-browser";

import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import {
  createAgent,
  getOAuthClient,
} from "@/services/post/bluesky/oauth-client-browser";
import type {
  BlueskyCredentials,
  OauthAuthorization,
  ServiceAccount,
} from "@/services/post/types";

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_BLUESKY_METADATA_URL ?? ""),
  serviceUrl: String(process.env.NEXT_PUBLIC_BLUESKY_SERVICE_URL ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = ["atproto", "transition:generic"];

// const OAUTH_STATE = "bluesky_auth";

// 1 minute
const ACCESS_TOKEN_BUFFER_SECONDS = 1 * 60;

// 2 days
const REFRESH_TOKEN_BUFFER_SECONDS = 2 * 24 * 60 * 60;

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

function getCredentialsId(credentials: BlueskyCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: BlueskyCredentials): boolean {
  return credentials.serviceUrl !== "" && credentials.username !== "";
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

function getRedirectUri(): string {
  const url = new URL(window.location.href);

  return `${url.origin}/authorize`;
}

function shouldHandleAuthRedirect(searchParams: URLSearchParams): boolean {
  return Boolean(
    searchParams.get("code") &&
      searchParams.get("state") &&
      searchParams.get("iss")?.includes("bsky"),
  );
}

function formatTokens(tokens: OAuthSession): OauthAuthorization {
  // Tokens have a 2 minutes lifespan (TODO: verify expiration)
  const expiresIn = 2 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 7-day lifespan
  const refreshExpiresIn = 7 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  // Access tokens are the same as the refresh token.
  // It is just the session DID.

  return {
    accessToken: tokens.sub,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.sub,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

async function getAuthorizationUrlHosted(
  credentials: BlueskyCredentials,
): Promise<string> {
  try {
    console.log("Starting OAuth flow for:", credentials.username);

    const response = await fetch("/api/hosted/bluesky/oauth/authorize", {
      body: JSON.stringify({
        username: credentials.username,
      }),
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
  credentials: BlueskyCredentials,
): Promise<string> {
  try {
    console.log("Starting OAuth flow for:", credentials.username);

    const client = await getOAuthClient(credentials);

    // The library handles all the complexity (PAR, DPoP, PKCE, etc.)
    const authUrl = await client.authorize(credentials.username, {
      scope: SCOPES.join(" "),
    });

    console.log("Authorization URL generated:", authUrl.toString());
    return authUrl.toString();
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth URL failed";
    console.error("Error creating authorization URL:", err);
    throw new Error(`Failed to create authorization URL: ${errMessage}`);
  }
}

// Handle OAuth callback and exchange code for tokens
async function exchangeCodeForTokens(
  code: string,
  iss: string,
  state: string,
  credentials: BlueskyCredentials,
): Promise<OauthAuthorization> {
  try {
    console.log("Processing OAuth callback...");

    const client = await getOAuthClient(credentials);

    // The library handles the token exchange internally
    const { session } = await client.callback(
      new URLSearchParams({ code, iss, state }),
    );
    console.log("OAuth session:", session);

    console.log("OAuth session created successfully");

    return formatTokens(session);
  } catch (err: unknown) {
    console.error("Token exchange error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to exchange code for tokens: ${errMessage}`);
  }
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  const response = await fetch("/api/hosted/bluesky/oauth/refresh", {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

// Refresh access token (handled internally by the library)
async function refreshAccessToken(
  credentials: BlueskyCredentials,
  authorization: OauthAuthorization,
): Promise<OauthAuthorization> {
  try {
    console.log("Refreshing access token...");

    const client = await getOAuthClient(credentials);

    // Try to restore the session (this will refresh tokens if needed)
    const session = await client.restore(authorization.accessToken);
    console.log("Refreshed session:", session);

    return formatTokens(session);
  } catch (err: unknown) {
    console.error("Token refresh error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to refresh token: ${errMessage}`);
  }
}

// Get user accounts using the session
async function getAccountsFromAgent(
  agent: Agent,
  accessToken: string,
): Promise<ServiceAccount[]> {
  try {
    console.log("Getting user accounts...");

    // Get the user's profile
    const profile = await agent.getProfile({ actor: accessToken });

    console.log("User profile retrieved:", profile.data);

    return [
      {
        id: profile.data.handle,
        username: profile.data.handle,
      },
    ];
  } catch (err: unknown) {
    console.error("Error getting accounts:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to get accounts: ${errMessage}`);
  }
}

// Get user accounts using the session
async function getAccounts(
  credentials: BlueskyCredentials,
  accessToken: string,
): Promise<ServiceAccount[]> {
  try {
    console.log("Getting user accounts...");

    // Create an Agent to make API calls
    const agent = await createAgent(credentials, accessToken);

    return getAccountsFromAgent(agent, accessToken);
  } catch (err: unknown) {
    console.error("Error getting accounts:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to get accounts: ${errMessage}`);
  }
}

// Export functions with the same signatures as before

export {
  exchangeCodeForTokens,
  getAccounts,
  getAccountsFromAgent,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
};
