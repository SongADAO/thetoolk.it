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

interface TiktokTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID ?? ""),
  clientSecret: String(process.env.TIKTOK_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = ["user.info.basic", "video.upload", "video.publish"];

const OAUTH_STATE = "tiktok_auth";

// 5 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

// 30 days
const REFRESH_TOKEN_BUFFER_SECONDS = 30 * 24 * 60 * 60;

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

function formatTokens(tokens: TiktokTokenResponse): OauthAuthorization {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

function formatExpiration(tokens: TiktokTokenResponse): OauthExpiration {
  const expiresIn = tokens.expires_in * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  const refreshExpiresIn = tokens.refresh_expires_in * 1000;
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
    client_key: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: `${OAUTH_STATE}----${codeChallenge}`,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

async function getAuthorizationUrlHosted(): Promise<string> {
  try {
    console.log("Starting OAuth flow for TikTok");

    const response = await fetch("/api/hosted/oauth/authorize", {
      body: JSON.stringify({ serviceId: "tiktok" }),
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
  setCodeVerifier: (codeVerifier: string) => void,
): Promise<string> {
  console.log("Starting TikTok authorization...");

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();

  // Store code verifier for later use
  setCodeVerifier(codeVerifier);

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
  mode = "hosted",
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

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    body: new URLSearchParams({
      client_key: credentials.clientId,
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
  console.log("Starting TikTok authentication...");

  const response = await fetch("/api/hosted/oauth/refresh", {
    body: JSON.stringify({ serviceId: "tiktok" }),
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
  console.log("Starting TikTok disconnection...");

  const response = await fetch("/api/hosted/oauth/deauthorize", {
    body: JSON.stringify({ serviceId: "tiktok" }),
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
  authorization: OauthAuthorization,
  credentials: OauthCredentials,
  expiration: OauthExpiration,
  mode = "hosted",
): Promise<OauthAuthorizationAndExpiration> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    body: new URLSearchParams({
      client_key: credentials.clientId,
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

  return {
    authorization: formatTokens(tokens),
    expiration: formatExpiration(tokens),
  };
}

// -----------------------------------------------------------------------------

async function getUserInfo(token: string): Promise<ServiceAccount> {
  console.log(`Checking Tiktok user info`);

  const params = new URLSearchParams({
    fields: "open_id,display_name",
  });

  const response = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Tiktok user info: ${errorText}`);
  }

  const userInfo = await response.json();
  console.log("Tiktok user info:", userInfo);

  return {
    id: userInfo.data.user.open_id,
    username: userInfo.data.user.display_name,
  };
}

async function getAccounts(
  token: string,
  mode = "hosted",
): Promise<ServiceAccount[]> {
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
