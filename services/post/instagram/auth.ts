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

interface InstagramTokenResponse {
  access_token: string;
  expires_in: number;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ?? ""),
  clientSecret: String(process.env.INSTAGRAM_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = [
  "instagram_business_basic",
  "instagram_business_content_publish",
];

const OAUTH_STATE = "instagram_auth";

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

function formatTokens(tokens: InstagramTokenResponse): OauthAuthorization {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.access_token,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatExpiration(tokens: InstagramTokenResponse): OauthExpiration {
  // Tokens have a 10 minutes lifespan (TODO: verify expiration)
  const expiresIn = 10 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 60-day lifespan
  const refreshExpiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  // Access tokens are the same as the refresh token.

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
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: `${OAUTH_STATE}----${codeChallenge}`,
  });

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

async function getAuthorizationUrlHosted(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials: OauthCredentials,
): Promise<string> {
  try {
    console.log("Starting OAuth flow for Instagram");

    const response = await fetch("/api/hosted/oauth/authorize", {
      body: JSON.stringify({ serviceId: "instagram" }),
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
  redirectUri: string,
  setCodeVerifier: (codeVerifier: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl: string,
): Promise<string> {
  console.log("Starting Instagram authorization...");

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();

  // Store code verifier for later use
  setCodeVerifier(codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return getAuthorizeUrl(credentials.clientId, redirectUri, codeChallenge);
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  iss: string,
  state: string,
  redirectUri: string,
  codeVerifier: string,
  credentials: OauthCredentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const endpoint =
    mode === "hosted"
      ? "https://api.instagram.com/oauth/access_token"
      : "/api/instagram/oauth/access_token";

  const response = await fetch(endpoint, {
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
    grant_type: "ig_exchange_token",
  });

  const longLivedTokenResponse = await fetch(
    `https://graph.instagram.com/v23.0/access_token?${longLivedParams.toString()}`,
  );

  if (!longLivedTokenResponse.ok) {
    const errorData = await longLivedTokenResponse.json();
    throw new Error(
      `Long lived token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const longLivedTokens = await longLivedTokenResponse.json();
  console.log(longLivedTokens);

  return {
    authorization: formatTokens(longLivedTokens),
    expiration: formatExpiration(longLivedTokens),
  };
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Starting Instagram authentication...");

  const response = await fetch("/api/hosted/oauth/refresh", {
    body: JSON.stringify({ serviceId: "instagram" }),
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
  console.log("Starting Instagram disconnection...");

  const response = await fetch("/api/hosted/oauth/deauthorize", {
    body: JSON.stringify({ serviceId: "instagram" }),
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  credentials: OauthCredentials,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expiration: OauthExpiration,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode = "hosted",
): Promise<OauthAuthorizationAndExpiration> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    access_token: authorization.refreshToken,
    grant_type: "ig_refresh_token",
  });

  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?${params.toString()}`,
  );

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
  console.log(`Checking Threads user info`);

  const params = new URLSearchParams({
    access_token: token,
    fields: "id,username",
  });

  const response = await fetch(
    `https://graph.instagram.com/v23.0/me?${params.toString()}`,
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

async function getAccounts(
  token: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
