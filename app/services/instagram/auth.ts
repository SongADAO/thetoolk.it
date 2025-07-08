import { hasExpired } from "@/app/services/helpers";
import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/app/services/types";

interface FacebookTokenResponse {
  access_token: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

// -----------------------------------------------------------------------------

const SCOPES = [
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
];

const OAUTH_STATE = "instagram_auth";

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

function formatTokens(tokens: FacebookTokenResponse) {
  // Tokens have a 60-day lifespan
  const expiresIn = 60 * 24 * 60 * 60;

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

  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  credentials: OauthCredentials,
  redirectUri: string,
) {
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

// Refresh tokens are automatically refreshed by Facebook when any API is called.
async function refreshAccessToken(authorization: OauthAuthorization) {
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

  // Calculate expiry time (60 days)
  const expiresIn = 60 * 24 * 60 * 60;
  const refreshExpiryTime = new Date(Date.now() + expiresIn);

  return {
    accessToken: authorization.accessToken,
    accessTokenExpiresAt: authorization.accessTokenExpiresAt,
    refreshToken: authorization.refreshToken,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
  };
}

// -----------------------------------------------------------------------------

async function getFacebookPages(token: string) {
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
    accessToken: page.access_token,
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
