import { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-browser";

import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import {
  createAgent,
  getOAuthClient,
} from "@/services/post/bluesky/oauth-client-browser";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";

const HOSTED_CREDENTIALS: OauthCredentials = {
  clientId: "",
  clientSecret: "",
  serviceUrl: String(process.env.NEXT_PUBLIC_BLUESKY_SERVICE_URL ?? ""),
  username: "",
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = ["atproto", "transition:generic"];

// const OAUTH_STATE = "bluesky_auth";

// 1 minute
const ACCESS_TOKEN_BUFFER_SECONDS = 1 * 60;

// 2 days
const REFRESH_TOKEN_BUFFER_SECONDS = 2 * 24 * 60 * 60;

// -----------------------------------------------------------------------------

function needsAccessTokenRenewal(expiration: OauthExpiration): boolean {
  if (!expiration.accessTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    expiration.accessTokenExpiresAt,
    ACCESS_TOKEN_BUFFER_SECONDS,
  );
}

function needsRefreshTokenRenewal(expiration: OauthExpiration): boolean {
  if (!expiration.refreshTokenExpiresAt) {
    return false;
  }

  return hasExpired(
    expiration.refreshTokenExpiresAt,
    REFRESH_TOKEN_BUFFER_SECONDS,
  );
}

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: OauthCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: OauthCredentials): boolean {
  return credentials.serviceUrl !== "" && credentials.username !== "";
}

function hasCompleteAuthorization(expiration: OauthExpiration): boolean {
  return (
    expiration.refreshTokenExpiresAt !== "" &&
    !needsRefreshTokenRenewal(expiration)
  );
}

function getAuthorizationExpiresAt(expiration: OauthExpiration): string {
  return expiration.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

function getRedirectUri(): string {
  const url = new URL(window.location.href);

  return `${url.origin}/authorize`;
}

function shouldHandleAuthCallback(searchParams: URLSearchParams): boolean {
  return Boolean(searchParams.get("iss")?.includes("bsky"));
}

function shouldHandleAuthRedirect(searchParams: URLSearchParams): boolean {
  return Boolean(
    shouldHandleAuthCallback(searchParams) &&
      searchParams.get("code") &&
      searchParams.get("state"),
  );
}

function formatTokens(tokens: OAuthSession): OauthAuthorization {
  return {
    accessToken: tokens.sub,
    refreshToken: tokens.sub,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatExpiration(tokens: OAuthSession): OauthExpiration {
  // Tokens have a 2 minutes lifespan (TODO: verify expiration)
  const expiresIn = 2 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 7-day lifespan
  const refreshExpiresIn = 7 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  // Access tokens are the same as the refresh token.
  // It is just the session DID.

  return {
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

function getAuthorizeUrl(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials: OauthCredentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redirectUri: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  codeChallenge: string,
): string {
  return "";
}

async function getAuthorizationUrlHosted(
  credentials: OauthCredentials,
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
    throw new Error(`Failed to create authorization URL: ${errMessage}`, {
      cause: err,
    });
  }
}

async function getAuthorizationUrl(
  credentials: OauthCredentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redirectUri: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCodeVerifier: (codeVerifier: string) => void,
  requestUrl: string,
): Promise<string> {
  try {
    console.log("Starting OAuth flow for:", credentials.username);

    const client = await getOAuthClient(credentials, requestUrl);

    // The library handles all the complexity (PAR, DPoP, PKCE, etc.)
    const authUrl = await client.authorize(credentials.username, {
      scope: SCOPES.join(" "),
    });

    console.log("Authorization URL generated:", authUrl.toString());
    return authUrl.toString();
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth URL failed";
    console.error("Error creating authorization URL:", err);
    throw new Error(`Failed to create authorization URL: ${errMessage}`, {
      cause: err,
    });
  }
}

// Handle OAuth callback and exchange code for tokens
async function exchangeCodeForTokens(
  code: string,
  iss: string,
  state: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redirectUri: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  codeVerifier: string,
  credentials: OauthCredentials,
  requestUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: "hosted" | "self",
): Promise<OauthAuthorizationAndExpiration> {
  try {
    console.log("Processing OAuth callback...");

    const client = await getOAuthClient(credentials, requestUrl);

    // The library handles the token exchange internally
    const { session } = await client.callback(
      new URLSearchParams({ code, iss, state }),
    );
    console.log("OAuth session:", session);

    console.log("OAuth session created successfully");

    return {
      authorization: formatTokens(session),
      expiration: formatExpiration(session),
    };
  } catch (err: unknown) {
    console.error("Token exchange error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to exchange code for tokens: ${errMessage}`, {
      cause: err,
    });
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

async function disconnectHosted(): Promise<OauthAuthorization> {
  console.log("Starting Bluesky disconnection...");

  const response = await fetch("/api/hosted/oauth/deauthorize", {
    body: JSON.stringify({ serviceId: "bluesky" }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Disconnect failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  return await response.json();
}

// Refresh access token (handled internally by the library)
async function refreshAccessToken(
  authorization: OauthAuthorization,
  credentials: OauthCredentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expiration: OauthExpiration,
  requestUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: "hosted" | "self",
): Promise<OauthAuthorizationAndExpiration> {
  try {
    console.log("Refreshing access token...");

    const client = await getOAuthClient(credentials, requestUrl);

    // Try to restore the session (this will refresh tokens if needed)
    const session = await client.restore(authorization.accessToken);
    console.log("Refreshed session:", session);

    return {
      authorization: formatTokens(session),
      expiration: formatExpiration(session),
    };
  } catch (err: unknown) {
    console.error("Token refresh error:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to refresh token: ${errMessage}`, { cause: err });
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
    throw new Error(`Failed to get accounts: ${errMessage}`, { cause: err });
  }
}

// Get user accounts using the session
async function getAccounts(
  credentials: OauthCredentials,
  accessToken: string,
  requestUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: "hosted" | "self",
): Promise<ServiceAccount[]> {
  try {
    console.log("Getting user accounts...");

    // Create an Agent to make API calls
    const agent = await createAgent(credentials, accessToken, requestUrl);

    return getAccountsFromAgent(agent, accessToken);
  } catch (err: unknown) {
    console.error("Error getting accounts:", err);
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to get accounts: ${errMessage}`, { cause: err });
  }
}

// Export functions with the same signatures as before

export {
  disconnectHosted,
  exchangeCodeForTokens,
  getAccounts,
  getAccountsFromAgent,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getAuthorizeUrl,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthCallback,
  shouldHandleAuthRedirect,
};
