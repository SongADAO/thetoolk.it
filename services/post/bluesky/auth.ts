import { hasExpired } from "@/lib/expiration";
import { objectIdHash } from "@/lib/hash";
import type {
  BlueskyCredentials,
  OauthAuthorization,
  ServiceAccount,
} from "@/services/post/types";

interface BlueskyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type: string;
  scope: string;
  // This is the user's DID
  sub: string;
}

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_BLUESKY_METADATA_URL ?? ""),
  serviceUrl: String(process.env.NEXT_PUBLIC_BLUESKY_SERVICE_URL ?? ""),
};

// -----------------------------------------------------------------------------

const SCOPES: string[] = ["atproto", "transition:generic"];

const OAUTH_STATE = "bluesky_auth";

// 2 minutes
const ACCESS_TOKEN_BUFFER_SECONDS = 2 * 60;

// 1 day
const REFRESH_TOKEN_BUFFER_SECONDS = 24 * 60 * 60;

// -----------------------------------------------------------------------------

function getClientMetadata() {
  return {
    application_type: "web",
    client_id: `${process.env.NEXT_PUBLIC_BASE_URL}/client-metadata.json`,
    client_name: "The Toolk.it",
    client_uri: process.env.NEXT_PUBLIC_BASE_URL,
    dpop_bound_access_tokens: true,
    grant_types: ["authorization_code", "refresh_token"],
    logo_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    redirect_uris: [`${process.env.NEXT_PUBLIC_BASE_URL}/oauth/callback`],
    response_types: ["code"],
    scope: "atproto transition:generic",
    token_endpoint_auth_method: "none",
  };
}

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

function getCredentialsId(credentials: BlueskyCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: BlueskyCredentials): boolean {
  return (
    credentials.appPassword !== "" &&
    credentials.serviceUrl !== "" &&
    credentials.username !== ""
  );
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

function getRedirectUri(): string {
  const url = new URL(window.location.href);
  return `${url.origin}/oauth/callback`;
}

function shouldHandleAuthRedirect(
  code: string | null,
  state: string | null,
): boolean {
  return Boolean(code && state?.includes(OAUTH_STATE));
}

function formatTokens(tokens: BlueskyTokenResponse): OauthAuthorization {
  // Access tokens expire in ~15 minutes for Bluesky
  const expiresIn = (tokens.expires_in ?? 15 * 60) * 1000;
  const expiryTime = new Date(Date.now() + expiresIn);

  // Refresh tokens last longer
  // 7 days
  const refreshExpiresIn = 7 * 24 * 60 * 60 * 1000;
  const refreshExpiryTime = new Date(Date.now() + refreshExpiresIn);

  return {
    accessToken: tokens.access_token,
    accessTokenExpiresAt: expiryTime.toISOString(),
    refreshToken: tokens.refresh_token,
    refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
    // Store Bluesky-specific data
    did: tokens.sub,
  };
}

// Generate PKCE challenge
async function generatePKCE() {
  const codeVerifier = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  )
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/[=]/gu, "");

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/[=]/gu, "");

  return { codeChallenge, codeVerifier };
}

// Generate DPoP proof JWT
async function generateDPoPProof(method: string, url: string, nonce?: string) {
  // Generate a key pair for DPoP
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  // Create JWK from public key
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

  const header = {
    alg: "ES256",
    jwk: publicKeyJwk,
    typ: "dpop+jwt",
  };

  const payload = {
    htm: method,
    htu: url,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(),
    ...(nonce && { nonce }),
  };

  // Simple JWT signing (you might want to use a proper JWT library)
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[=]/gu, "");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[=]/gu, "");
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    { hash: "SHA-256", name: "ECDSA" },
    keyPair.privateKey,
    new TextEncoder().encode(message),
  );

  const encodedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signature)),
  )
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/[=]/gu, "");

  return `${message}.${encodedSignature}`;
}

// Resolve Bluesky handle to find the user's PDS
async function resolveHandle(
  serviceUrl: string,
  username: string,
): Promise<string> {
  const response = await fetch(
    `${serviceUrl}/xrpc/com.atproto.identity.resolveHandle?handle=${username}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to resolve handle: ${username}`);
  }

  const data = await response.json();
  return data.did;
}

// Get the user's PDS from their DID
async function getPDSEndpoint(did: string): Promise<string> {
  const response = await fetch(`https://plc.directory/${did}`);

  if (!response.ok) {
    throw new Error(`Failed to get PDS for DID: ${did}`);
  }

  const data = await response.json();
  const service = data.service?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (serviceDetails: any) =>
      serviceDetails.type === "AtprotoPersonalDataServer",
  );

  if (!service) {
    throw new Error("No PDS found for user");
  }

  return service.serviceEndpoint;
}

// Get authorization server metadata
async function getAuthServerMetadata(pdsUrl: string, serviceUrl: string) {
  // Check if this is a Bluesky-hosted PDS (mushroom server)
  const isBlueskyHosted = pdsUrl.includes(".host.bsky.network");

  // For Bluesky-hosted PDSs, use the entryway service as the authorization server
  const authServerUrl = isBlueskyHosted ? serviceUrl : pdsUrl;

  console.log(
    `Fetching auth server metadata from: ${authServerUrl}/.well-known/oauth-authorization-server`,
  );

  const response = await fetch(
    `${authServerUrl}/.well-known/oauth-authorization-server`,
  );

  if (!response.ok) {
    throw new Error("Failed to get authorization server metadata");
  }

  return await response.json();
}

// Generate authorization URL for Bluesky
async function getAuthorizationUrl(
  metadataUrl: string,
  redirectUrl: string,
  serviceUrl: string,
  username: string,
): Promise<string> {
  try {
    // 1. Resolve handle to DID
    const did = await resolveHandle(serviceUrl, username);
    console.log(`Resolved DID: ${did}`);

    // 2. Get user's PDS
    const pdsUrl = await getPDSEndpoint(did);
    console.log(`User's PDS URL: ${pdsUrl}`);

    // 3. Get auth server metadata
    const metadata = await getAuthServerMetadata(pdsUrl, serviceUrl);

    // 4. Generate PKCE
    const { codeChallenge } = await generatePKCE();

    // 5. Create authorization URL
    const params = new URLSearchParams({
      client_id: metadataUrl,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      login_hint: username,
      redirect_uri: redirectUrl,
      response_type: "code",
      scope: SCOPES.join(" "),
      state: OAUTH_STATE,
    });
    console.log("Authorization URL parameters:", params.toString());

    return `${metadata.authorization_endpoint}?${params.toString()}`;
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth URL failed";
    console.error("Error creating authorization URL:", err);
    throw new Error(`Failed to create authorization URL: ${errMessage}`);
  }
}

async function exchangeCodeForTokensHosted(
  code: string,
  metadataUrl: string,
  redirectUri: string,
  codeVerifier: string,
  tokenEndpoint: string,
): Promise<OauthAuthorization> {
  console.log("Starting Bluesky authentication...");

  const response = await fetch("/api/hosted/bluesky/exchange-tokens", {
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      metadata_url: metadataUrl,
      redirect_uri: redirectUri,
      state: OAUTH_STATE,
      token_endpoint: tokenEndpoint,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Authentication failed: ${errorData.message ?? errorData.error}`,
    );
  }

  return await response.json();
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  metadataUrl: string,
  codeVerifier: string,
  tokenEndpoint: string,
): Promise<OauthAuthorization> {
  console.log("Exchanging code for Bluesky tokens...");

  const response = await fetch(tokenEndpoint, {
    body: new URLSearchParams({
      client_id: metadataUrl,
      code,
      code_verifier: codeVerifier,
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

  return formatTokens(tokens);
}

async function refreshAccessTokenHosted(): Promise<OauthAuthorization> {
  console.log("Refreshing Bluesky tokens...");

  const response = await fetch("/api/hosted/bluesky/refresh-tokens", {
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

// Refresh access token using refresh token
async function refreshAccessToken(
  authorization: OauthAuthorization,
): Promise<OauthAuthorization> {
  if (!authorization.refreshToken) {
    throw new Error("No refresh token available");
  }

  // This would require implementing the full DPoP flow
  // For now, delegate to hosted implementation
  return refreshAccessTokenHosted();
}

// -----------------------------------------------------------------------------

async function getUserInfo(
  token: string,
  serviceUrl?: string,
): Promise<ServiceAccount> {
  console.log(`Getting Bluesky user info`);

  const dpopProof = await generateDPoPProof(
    "GET",
    `${serviceUrl}/xrpc/com.atproto.repo.getRecord`,
  );

  const response = await fetch(
    `${serviceUrl}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(token)}&collection=app.bsky.actor.profile&rkey=self`,
    {
      headers: {
        Authorization: `DPoP ${token}`,
        DPoP: dpopProof,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  const data = await response.json();
  const profile = data.value;

  console.log("Bluesky user info:", profile);

  return {
    id: token,
    username: profile.handle,
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
  exchangeCodeForTokensHosted,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getClientMetadata,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
};
