import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/app/services/types";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

const SCOPES = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_show_list",
];

function getAuthorizationUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state: "facebook_auth",
  });

  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
}

function formatTokens(tokens: GoogleTokenResponse) {
  const expiresIn = 5184000000;

  // Calculate expiry time
  // const expiryTime = new Date(Date.now() + tokens.expires_in * 1000);
  const expiryTime = new Date(Date.now() + expiresIn);

  // const refreshExpiryTime = new Date(
  //   Date.now() + tokens.refresh_token_expires_in * 1000,
  // );

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.access_token,
    refreshTokenExpiresAt: expiryTime.toISOString(),
    // refreshToken: tokens.refresh_token,
    // refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
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
    "https://graph.facebook.com/v23.0/oauth/access_token",
    {
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
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

  // Get long-lived token
  const longLivedParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
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
  return code && state?.includes("facebook_auth");
}

// Get Facebook Pages
async function getFacebookPages(token: string) {
  console.log("Getting Facebook pages...");

  const pagesResponse = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${token}`,
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

async function getFacebookAccountFromPage(
  page: FacebookPage,
): Promise<ServiceAccount> {
  console.log(`Checking page: ${page.name} (ID: ${page.id})`);

  // Test access to the Facebook account
  const testResponse = await fetch(
    `https://graph.facebook.com/v23.0/${page.id}?fields=id,name&access_token=${page.access_token}`,
  );

  if (!testResponse.ok) {
    console.error("Facebook API error:", await testResponse.text());
    throw new Error(`Facebook account found but not accessible: ${page.name}:`);
  }

  const testData = await testResponse.json();
  console.log("✅ Facebook Account Details:", testData);

  return {
    accessToken: page.access_token,
    id: page.id,
    username: page.name,
  };
}

// Get Facebook Accounts from Facebook Pages
async function getFacebookAccounts(token: string): Promise<ServiceAccount[]> {
  const facebookPages = await getFacebookPages(token);

  const fbAccounts = [];

  for (const page of facebookPages) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const fbAccount = await getFacebookAccountFromPage(page);

      fbAccounts.push(fbAccount);
    } catch (error) {
      console.error("Error getting Facebook account:", error);
    }
  }

  return fbAccounts;
}

export {
  exchangeCodeForTokens,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getFacebookAccounts,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  refreshAccessToken,
  shouldHandleAuthRedirect,
};
