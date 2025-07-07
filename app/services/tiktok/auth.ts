import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/app/services/types";

interface TiktokTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

const SCOPES = ["user.info.basic", "video.upload", "video.publish"];

function getAuthorizationUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_key: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: "tiktok_auth",
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

function formatTokens(tokens: TiktokTokenResponse) {
  const expiresIn = tokens.expires_in * 1000;
  const refreshExpiresIn = tokens.refresh_expires_in * 1000;

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

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  const tokenResponse = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(
      `Token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const tokens = await tokenResponse.json();
  console.log(tokens);

  return formatTokens(tokens);
}

// Refresh access token using refresh token
async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  authorization: OauthAuthorization,
) {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    client_key: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: authorization.refreshToken,
  });

  const response = await fetch(
    `https://open.tiktokapis.com/v2/oauth/token/?${params.toString()}`,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  const tokens = await response.json();

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

function getRedirectUri() {
  const url = new URL(window.location.href);
  const baseUrl = url.origin + url.pathname;

  return baseUrl;
}

function shouldHandleAuthRedirect(code: string | null, state: string | null) {
  return code && state?.includes("tiktok_auth");
}

// Get Tiktok user info to get the correct ID
async function getTiktokUserInfo(token: string): Promise<ServiceAccount> {
  console.log(`Checking Tiktok user info`);

  const params = new URLSearchParams({
    fields: "open_id,union_id,avatar_url,display_name",
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
    accessToken: token,
    id: userInfo.data.user.open_id,
    username: userInfo.data.user.display_name,
  };
}

// Get Tiktok Accounts from Facebook Pages
async function getTiktokAccounts(token: string): Promise<ServiceAccount[]> {
  const accounts = [];

  const account = await getTiktokUserInfo(token);

  accounts.push(account);

  return accounts;
}

export {
  exchangeCodeForTokens,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  getTiktokAccounts,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  needsTokenRefresh,
  refreshAccessToken,
  shouldHandleAuthRedirect,
};
