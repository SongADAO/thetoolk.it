import {
  generateCodeChallenge,
  generateCodeVerifier,
  hasExpired,
} from "@/app/services/helpers";
import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/app/services/types";

interface TwitterTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

// -----------------------------------------------------------------------------

const SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
  "media.write",
];

const OAUTH_STATE = "twitter_auth";

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

function getCredentialsId(credentials: OauthCredentials) {
  return JSON.stringify(credentials);
}

function hasCompleteCredentials(credentials: OauthCredentials) {
  return credentials.clientId !== "" && credentials.clientSecret !== "";
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

function getRedirectUri() {
  const url = new URL(window.location.href);
  const baseUrl = url.origin + url.pathname;

  return baseUrl;
}

function shouldHandleAuthRedirect(code: string | null, state: string | null) {
  return code && state?.includes(OAUTH_STATE);
}

function formatTokens(tokens: TwitterTokenResponse) {
  const expiresIn = tokens.expires_in * 1000;
  // Refresh Tokens have a 6-month lifespan.
  const refreshExpiresIn = 180 * 24 * 60 * 60 * 1000;

  // Calculate expiry time
  const expiryTime = new Date(Date.now() + expiresIn);
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.refresh_token,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

async function getAuthorizationUrl(
  credentials: OauthCredentials,
  redirectUri: string,
) {
  console.log("Starting Twitter authorization...");

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();

  // Store code verifier for later use
  localStorage.setItem("thetoolkit_twitter_code_verifier", codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    state: OAUTH_STATE,
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  credentials: OauthCredentials,
  redirectUri: string,
) {
  const codeVerifier = localStorage.getItem("thetoolkit_twitter_code_verifier");

  if (!codeVerifier) {
    throw new Error(
      "Code verifier not found. Please restart the authorization process.",
    );
  }

  const response = await fetch("/api/twitter/2/oauth2/token", {
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

// Refresh access token using refresh token
async function refreshAccessToken(authorization: OauthAuthorization) {
  // TODO: Twitter refresh token renewal
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    access_token: authorization.refreshToken,
    grant_type: "th_refresh_token",
  });

  const response = await fetch(
    `https://graph.twitter.net/refresh_access_token?${params.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await response.json();
  console.log(tokens);

  return formatTokens(tokens);
}

// -----------------------------------------------------------------------------

async function getUserInfo(token: string): Promise<ServiceAccount> {
  console.log(`Checking Twitter user info`);

  const response = await fetch("/api/twitter/2/users/me", {
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
    accessToken: token,
    id: userInfo.data.id,
    username: userInfo.data.username,
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
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  needsTokenRefresh,
  refreshAccessToken,
  shouldHandleAuthRedirect,
};
