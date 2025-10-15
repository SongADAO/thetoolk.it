import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/code-verifier";
import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID ?? ""),
  clientSecret: String(process.env.YOUTUBE_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];

const OAUTH_STATE = "youtube_auth";

// 5 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

// Never expires
const REFRESH_TOKEN_BUFFER_SECONDS = -1 * 100 * 365 * 24 * 60 * 60;

// 5 days
// const REFRESH_TOKEN_BUFFER_SECONDS = 5 * 24 * 60 * 60;

// 30 days
// const REFRESH_TOKEN_BUFFER_SECONDS = 30 * 24 * 60 * 60;

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
  return credentials.clientId !== "" && credentials.clientSecret !== "";
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

function formatTokens(tokens: GoogleTokenResponse): OauthAuthorization {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

function formatExpiration(tokens: GoogleTokenResponse): OauthExpiration {
  const expiresIn = tokens.expires_in * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  const refreshExpiresIn = tokens.refresh_token_expires_in * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  return {
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

function getAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    access_type: "offline",
    client_id: clientId,
    prompt: "consent",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    state: `${OAUTH_STATE}----${codeChallenge}`,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function getAuthorizationUrlHosted(): Promise<string> {
  try {
    console.log("Starting OAuth flow for YouTube");

    const response = await fetch("/api/hosted/oauth/authorize", {
      body: JSON.stringify({ serviceId: "youtube" }),
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
  clientId: string,
  redirectUri: string,
): Promise<string> {
  console.log("Starting YouTube authorization...");

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();

  // Store code verifier for later use
  localStorage.setItem("thetoolkit_youtube_code_verifier", codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return getAuthorizeUrl(clientId, redirectUri, codeChallenge);
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  state: string,
  credentials: OauthCredentials,
): Promise<OauthAuthorizationAndExpiration> {
  if (!codeVerifier) {
    throw new Error(
      "Code verifier not found. Please restart the authorization process.",
    );
  }

  if (!state) {
    throw new Error(
      "Code challenge not found. Please restart the authorization process.",
    );
  }

  const codeChallenge = await generateCodeChallenge(codeVerifier);
  if (`${OAUTH_STATE}----${codeChallenge}` !== state) {
    throw new Error(
      "Code verifier does not match code challenge. Please restart the authorization process.",
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
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

  return {
    authorization: formatTokens(tokens),
    expiration: formatExpiration(tokens),
  };
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Starting YouTube authentication...");

  const response = await fetch("/api/hosted/oauth/refresh", {
    body: JSON.stringify({ serviceId: "youtube" }),
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

async function disconnectHosted(): Promise<OauthAuthorization> {
  console.log("Starting YouTube disconnection...");

  const response = await fetch("/api/hosted/oauth/deauthorize", {
    body: JSON.stringify({ serviceId: "youtube" }),
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

// Refresh access token using refresh token
async function refreshAccessToken(
  credentials: OauthCredentials,
  authorization: OauthAuthorization,
): Promise<OauthAuthorizationAndExpiration> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: "refresh_token",
      refresh_token: authorization.refreshToken,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await response.json();
  console.log(tokens);

  // The refresh token doesn't change, but is also not in the returned data,
  // so we copy over the existing one.
  if (typeof tokens.refresh_token === "undefined") {
    tokens.refresh_token = authorization.refreshToken;
  }

  return {
    authorization: formatTokens(tokens),
    expiration: formatExpiration(tokens),
  };
}

// -----------------------------------------------------------------------------

async function getUserInfo(token: string): Promise<ServiceAccount> {
  console.log(`Checking YouTube user info`);

  const params = new URLSearchParams({
    fields: "items(id,snippet(title,customUrl))",
    mine: "true",
    part: "snippet",
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("No channel found for this account");
  }

  const channel = data.items[0];
  console.log("YouTube user info:", channel);

  return {
    id: channel.id,
    username: channel.snippet.title,
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
  disconnectHosted,
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getAuthorizeUrl,
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
