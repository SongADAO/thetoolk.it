import { hasExpired } from "@/app/services/storage/helpers";
import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/app/services/storage/types";

interface AmazonS3TokenResponse {
  access_token: string;
}

interface AmazonS3Page {
  id: string;
  name: string;
  access_token: string;
}

// -----------------------------------------------------------------------------

const SCOPES = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_show_list",
];

const OAUTH_STATE = "amazon-s3_auth";

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

function formatTokens(tokens: AmazonS3TokenResponse) {
  // Tokens have a 60-day lifespan
  const expiresIn = 60 * 24 * 60 * 60 * 1000;

  // Calculate expiry time
  const expiryTime = new Date(Date.now() + expiresIn);

  // Access tokens are the same as the refresh token.

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.access_token,
    refreshTokenExpiresAt: expiryTime.toISOString(),
  };
}

function getAuthorizationUrl(
  credentials: OauthCredentials,
  redirectUri: string,
) {
  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: OAUTH_STATE,
  });

  return `https://www.amazon-s3.com/v23.0/dialog/oauth?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  credentials: OauthCredentials,
  redirectUri: string,
) {
  const response = await fetch(
    "https://graph.amazon-s3.com/v23.0/oauth/access_token",
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
    `https://graph.amazon-s3.com/v23.0/oauth/access_token?${longLivedParams.toString()}`,
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

// Refresh tokens are automatically refreshed by AmazonS3 when any API is called.
async function refreshAccessToken(authorization: OauthAuthorization) {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    access_token: authorization.refreshToken,
  });

  const response = await fetch(
    `https://graph.amazon-s3.com/v23.0/me/accounts?${params.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Token refresh failed: ${errorData.error_description ?? errorData.error}`,
    );
  }

  // Refresh tokens are automatically refreshed by AmazonS3 when the API is called.
  // So instead of getting a new authorization, we just query a basic API to trigger
  // a refresh and then update the expiration time of the existing tokens.

  // Calculate expiry time (60 days)
  const expiresIn = 60 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + expiresIn);

  return {
    accessToken: authorization.accessToken,
    accessTokenExpiresAt: authorization.accessTokenExpiresAt,
    refreshToken: authorization.refreshToken,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

// -----------------------------------------------------------------------------

async function getAmazonS3Pages(token: string) {
  console.log("Getting AmazonS3 pages...");

  const params = new URLSearchParams({
    access_token: token,
  });

  const pagesResponse = await fetch(
    `https://graph.amazon-s3.com/v23.0/me/accounts?${params.toString()}`,
  );

  if (!pagesResponse.ok) {
    const error = await pagesResponse.json();
    console.error("Pages API error:", error);
    throw new Error(
      `Failed to get AmazonS3 pages: ${error.error?.message ?? pagesResponse.statusText}`,
    );
  }

  const pagesData = await pagesResponse.json();
  console.log("Pages data:", pagesData);

  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error(
      "No AmazonS3 pages found. You need to create a AmazonS3 page to post videos.",
    );
  }

  console.log(`Found ${pagesData.data.length} AmazonS3 page(s)`);

  return pagesData.data;
}

async function getUserInfoFromPage(
  page: AmazonS3Page,
): Promise<ServiceAccount> {
  console.log(`Checking page: ${page.name} (ID: ${page.id})`);

  const params = new URLSearchParams({
    access_token: page.access_token,
    fields: "id,name",
  });

  // Test access to the AmazonS3 account
  const testResponse = await fetch(
    `https://graph.amazon-s3.com/v23.0/${page.id}?${params.toString()}`,
  );

  if (!testResponse.ok) {
    console.error("AmazonS3 API error:", await testResponse.text());
    throw new Error(`AmazonS3 account found but not accessible: ${page.name}:`);
  }

  const testData = await testResponse.json();
  console.log("✅ AmazonS3 Account Details:", testData);

  return {
    accessToken: page.access_token,
    id: page.id,
    username: page.name,
  };
}

async function getAccounts(token: string): Promise<ServiceAccount[]> {
  const facebookPages = await getAmazonS3Pages(token);

  const accounts = [];

  for (const page of facebookPages) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const account = await getUserInfoFromPage(page);

      accounts.push(account);
    } catch (error) {
      console.error("Error getting AmazonS3 account:", error);
    }
  }

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
