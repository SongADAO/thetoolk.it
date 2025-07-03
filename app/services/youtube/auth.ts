import type {
  OauthAuthorization,
  OauthCredentials,
} from "@/app/services/types";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];

function getAuthorizationUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    access_type: "offline",
    client_id: clientId,
    prompt: "consent",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function formatTokens(tokens: GoogleTokenResponse) {
  // Calculate expiry time
  const expiryTime = new Date(Date.now() + tokens.expires_in * 1000);

  const refreshExpiryTime = new Date(
    Date.now() + tokens.refresh_token_expires_in * 1000,
  );

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.refresh_token,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(
      `Token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await tokenResponse.json();

  return formatTokens(tokens);
}

// Refresh access token using refresh token
async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) {
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await tokenResponse.json();

  return formatTokens(tokens);
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

function getRedirectUri() {
  const url = new URL(window.location.href);
  const baseUrl = url.origin + url.pathname;

  return baseUrl;
}

function shouldHandleCodeAndScope(code: string | null, scope: string | null) {
  return code && scope?.includes("https://www.googleapis.com");
}

export {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  refreshAccessToken,
  shouldHandleCodeAndScope,
};
