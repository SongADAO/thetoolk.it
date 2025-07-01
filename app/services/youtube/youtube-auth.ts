function getAuthorizationUrl(clientId: string, redirectUri: string) {
  const SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];

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

  // Calculate expiry time
  const expiryTime = new Date(Date.now() + tokens.expires_in * 1000);

  // Store in localStorage
  return {
    access_token: tokens.access_token,
    expires_at: expiryTime.toISOString(),
    refresh_token: tokens.refresh_token,
  };
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

  // Calculate expiry time
  const expiryTime = new Date(Date.now() + tokens.expires_in * 1000);

  return {
    access_token: tokens.access_token,
    expires_at: expiryTime.toISOString(),
    refresh_token: tokens.refresh_token,
  };
}

function hasTokenExpired(tokenExpiry: Date | null) {
  // Check if token is expired or about to expire (5 minutes buffer)
  const now = new Date();

  // 5 minutes in milliseconds
  const bufferTime = 5 * 60 * 1000;

  return tokenExpiry && now.getTime() > tokenExpiry.getTime() - bufferTime;
}

export {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  hasTokenExpired,
  refreshAccessToken,
};
