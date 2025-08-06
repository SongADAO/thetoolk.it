import { DEBUG_POST } from "@/config/constants";
import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/services/post/types";

interface FacebookTokenResponse {
  access_token: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_INSTAGRAMFB_CLIENT_ID ?? ""),
  clientSecret: String(process.env.INSTAGRAMFB_CLIENT_SECRET ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = [
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
  "pages_read_engagement",
  "pages_show_list",
];

const OAUTH_STATE = "instagram_auth";

// 5 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

// 30 days
const REFRESH_TOKEN_BUFFER_SECONDS = 30 * 24 * 60 * 60;

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

function getCredentialsId(credentials: OauthCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: OauthCredentials): boolean {
  return credentials.clientId !== "" && credentials.clientSecret !== "";
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

function getRedirectUriHosted(): string {
  const url = new URL(window.location.href);

  return `${url.origin}/api/hosted/oauth/authorize`;
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

function formatTokens(tokens: FacebookTokenResponse): OauthAuthorization {
  // Tokens have a 10 minutes lifespan (TODO: verify expiration)
  const expiresIn = 10 * 60 * 60 * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens have a 60-day lifespan
  const refreshExpiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  // Access tokens are the same as the refresh token.

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.access_token,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

function getAuthorizationUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: OAUTH_STATE,
  });

  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  credentials: OauthCredentials,
): Promise<OauthAuthorization> {
  const response = await fetch(
    "https://graph.facebook.com/v23.0/oauth/access_token",
    {
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );

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
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    fb_exchange_token: tokens.access_token,
    grant_type: "fb_exchange_token",
  });

  const longLivedTokenResponse = await fetch(
    `https://graph.facebook.com/v23.0/oauth/access_token?${longLivedParams.toString()}`,
  );

  if (!longLivedTokenResponse.ok) {
    const errorData = await longLivedTokenResponse.json();
    throw new Error(
      `Long lived token exchange failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  const longLivedTokens = await longLivedTokenResponse.json();
  console.log(longLivedTokens);

  return formatTokens(longLivedTokens);
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Starting Facebook authentication...");

  const response = await fetch("/api/hosted/instagramfb/refresh-tokens", {
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

// Refresh tokens are automatically refreshed by Facebook when any API is called.
async function refreshAccessToken(
  authorization: OauthAuthorization,
): Promise<OauthAuthorization> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    access_token: authorization.refreshToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?${params.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  // Refresh tokens are automatically refreshed by Facebook when the API is called.
  // So instead of getting a new authorization, we just query a basic API to trigger
  // a refresh and then update the expiration time of the existing tokens.

  // Refresh tokens have a 60-day lifespan
  const refreshExpiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  return {
    accessToken: authorization.accessToken,
    accessTokenExpiresAt: authorization.accessTokenExpiresAt,
    refreshToken: authorization.refreshToken,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

// -----------------------------------------------------------------------------

async function getFacebookPages(token: string): Promise<FacebookPage[]> {
  console.log("Getting Facebook pages...");

  const params = new URLSearchParams({
    access_token: token,
  });

  const pagesResponse = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?${params.toString()}`,
  );

  if (!pagesResponse.ok) {
    const error = await pagesResponse.json();
    console.error("Pages API error:", error);
    throw new Error(
      `Failed to get Facebook pages: ${error.error?.message ?? pagesResponse.statusText}`,
    );
  }

  const pagesData = await pagesResponse.json();
  console.log("Pages data:", pagesData);

  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error(
      "No Facebook pages found. You need to create a Facebook page to post videos.",
    );
  }

  console.log(`Found ${pagesData.data.length} Facebook page(s)`);

  return pagesData.data;
}

async function getUserInfoFromPage(
  page: FacebookPage,
): Promise<ServiceAccount> {
  console.log(`Checking page: ${page.name} (ID: ${page.id})`);

  const params = new URLSearchParams({
    access_token: page.access_token,
  });

  const igResponse = await fetch(
    `https://graph.facebook.com/v23.0/${page.id}/instagram_accounts?${params.toString()}`,
  );

  if (!igResponse.ok) {
    console.error("Instagram API error:", await igResponse.text());
    throw new Error(`Failed to check Instagram for page ${page.name}:`);
  }

  const igData = await igResponse.json();
  console.log(`Instagram data for page ${page.name}:`, igData);

  if (!igData.data || igData.data.length === 0) {
    throw new Error(
      `No IG data returned for instagram account for page ${page.name}.`,
    );
  }

  // Check if it's actually accessible
  const igId = igData.data[0].id;

  const userParams = new URLSearchParams({
    access_token: page.access_token,
    fields: "id,username",
  });

  // Test access to the Instagram account
  const userResponse = await fetch(
    `https://graph.facebook.com/v23.0/${igId}?${userParams.toString()}`,
  );

  if (!userResponse.ok) {
    console.error("Instagram API error:", await userResponse.text());
    throw new Error(
      `Instagram account found but not accessible: ${page.name}:`,
    );
  }

  const userData = await userResponse.json();
  console.log("✅ Instagram Account Details:", userData);

  return {
    id: userData.id,
    username: userData.username,
  };
}

async function getAccounts(token: string): Promise<ServiceAccount[]> {
  const facebookPages = await getFacebookPages(token);

  const accounts = [];

  for (const page of facebookPages) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const account = await getUserInfoFromPage(page);

      accounts.push(account);
    } catch (error) {
      console.error("Error getting Instagram account:", error);
    }
  }

  return accounts;
}

async function getAccountAccessToken(
  token: string,
  accountId: string,
): Promise<string> {
  if (DEBUG_POST) {
    return "test-account-token";
  }

  const facebookPages = await getFacebookPages(token);
  const pages = facebookPages.filter((page) => page.id === accountId);

  if (pages.length !== 1) {
    throw new Error("Could not get page access token");
  }

  return pages[0].access_token;
}

// -----------------------------------------------------------------------------

export {
  exchangeCodeForTokens,
  getAccountAccessToken,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
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
