import { Agent } from "@atproto/api";
import {
  BrowserOAuthClient,
  type OAuthSession,
} from "@atproto/oauth-client-browser";

import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
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

const OAUTH_STATE = "bluesky_auth";

// 2 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 2 * 60;

// 1 day
const REFRESH_TOKEN_BUFFER_SECONDS = 24 * 60 * 60;

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
  return (
    credentials.appPassword !== "" &&
    credentials.serviceUrl !== "" &&
    credentials.username !== ""
  );
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

function shouldHandleAuthRedirect(
  code: string | null,
  iss: string | null,
): boolean {
  return Boolean(code && iss?.includes("bsky"));
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

// -----------------------------------------------------------------------------

// OAuth client instance (singleton)
let oauthClient: BrowserOAuthClient | null = null;

// Client metadata (to be served at your client_id URL)
function getClientMetadata() {
  return {
    application_type: "web",
    client_id: `${process.env.NEXT_PUBLIC_BASE_URL}/client-metadata.json`,
    client_name: "The Toolk.it",
    client_uri: process.env.NEXT_PUBLIC_BASE_URL,
    dpop_bound_access_tokens: true,
    grant_types: ["authorization_code", "refresh_token"],
    logo_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    redirect_uris: [`${process.env.NEXT_PUBLIC_BASE_URL}/authorize`],
    response_types: ["code"],
    scope: "atproto transition:generic",
    token_endpoint_auth_method: "none",
  };
}

// Initialize the OAuth client
async function getOAuthClient(
  credentials: BlueskyCredentials,
): Promise<BrowserOAuthClient> {
  if (!oauthClient) {
    const clientMetadata = getClientMetadata();

    oauthClient = await BrowserOAuthClient.load({
      clientId: clientMetadata.client_id,
      handleResolver: credentials.serviceUrl || "https://bsky.social",
      // Instead of 'fragment' (default)
      responseMode: "query",
    });
  }

  return oauthClient;
}

// Get a valid session for making API calls
async function getValidSession(
  authorization: OauthAuthorization,
): Promise<OAuthSession> {
  if (!oauthClient) {
    throw new Error("OAuth client not initialized");
  }

  return await oauthClient.restore(authorization.accessToken);
}

// Create an Agent for making API calls
async function createAgent(authorization: OauthAuthorization): Promise<Agent> {
  return new Agent(await getValidSession(authorization));
}

// Clear OAuth session
function clearAuthSession(): void {
  if (oauthClient) {
    // The library manages its own storage, so we just need to clear our reference
    oauthClient = null;
  }
  console.log("OAuth session cleared");
}

// Check if we have a valid session
async function hasValidSession(
  authorization: OauthAuthorization,
): Promise<boolean> {
  try {
    if (!oauthClient || !authorization.accessToken) {
      return false;
    }

    await oauthClient.restore(authorization.accessToken);

    return true;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------

async function getAuthorizationUrl(
  credentials: BlueskyCredentials,
): Promise<string> {
  try {
    console.log("Starting OAuth flow for:", credentials.username);

    const client = await getOAuthClient({
      appPassword: "",
      serviceUrl: credentials.serviceUrl,
      username: credentials.username,
    });

    // The library handles all the complexity (PAR, DPoP, PKCE, etc.)
    const authUrl = await client.authorize(credentials.username, {
      scope: "atproto transition:generic",
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

    const client = await getOAuthClient({
      appPassword: "",
      serviceUrl: credentials.serviceUrl,
      username: credentials.username,
    });

    // The library handles the token exchange internally
    const { session } = await client.callback(
      new URLSearchParams({ code, iss, state }),
    );

    console.log("OAuth session created successfully");

    return formatTokens(session);
  } catch (err: unknown) {
    console.error("Token exchange error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to exchange code for tokens: ${errMessage}`);
  }
}

// Refresh access token (handled internally by the library)
async function refreshAccessToken(
  credentials: BlueskyCredentials,
  authorization: OauthAuthorization,
  mode?: string,
): Promise<OauthAuthorization> {
  try {
    console.log("Refreshing access token...");

    const client = await getOAuthClient({
      appPassword: "",
      serviceUrl: credentials.serviceUrl,
      username: credentials.username,
    });

    // Try to restore the session (this will refresh tokens if needed)
    await client.restore(authorization.accessToken);

    console.log("Access token refreshed successfully");

    // Return updated authorization (the library handles token refresh internally)
    return {
      ...authorization,
      accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    };
  } catch (err: unknown) {
    console.error("Token refresh error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to refresh token: ${errMessage}`);
  }
}

// Get user accounts using the session
async function getAccounts(
  // This is actually the DID in our case
  token: string,
  mode?: string,
): Promise<ServiceAccount[]> {
  try {
    console.log("Getting user accounts...");

    if (!oauthClient) {
      throw new Error("OAuth client not initialized");
    }

    // Restore the session using the DID
    const session = await oauthClient.restore(token);

    // Create an Agent to make API calls
    const agent = new Agent(session);

    // Get the user's profile
    const profile = await agent.getProfile({ actor: session.sub });

    console.log("User profile retrieved:", profile.data);

    return [
      {
        id: session.sub,
        username: profile.data.handle,
      },
    ];
  } catch (err: unknown) {
    console.error("Error getting accounts:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to get accounts: ${errMessage}`);
  }
}

// Export functions with the same signatures as before

function exchangeCodeForTokensHosted() {}
function refreshAccessTokenHosted() {}

export {
  exchangeCodeForTokens,
  exchangeCodeForTokensHosted,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getClientMetadata,
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
