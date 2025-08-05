/* eslint-disable max-classes-per-file */

import { Agent } from "@atproto/api";
import { JoseKey } from "@atproto/jwk-jose";
import {
  NodeOAuthClient,
  type NodeSavedSessionStore,
  type NodeSavedStateStore,
  type OAuthSession,
} from "@atproto/oauth-client-node";

import type { BlueskyCredentials } from "@/services/post/types";

const SCOPES: string[] = ["atproto", "transition:generic"];

// OAuth client instance (singleton)
let oauthClient: NodeOAuthClient | null = null;

// Client metadata (to be served at your client_id URL)
function getClientMetadata() {
  return {
    application_type: "web",
    client_id: `${process.env.NEXT_PUBLIC_BASE_URL}/client-metadata-node.json`,
    client_name: "The Toolk.it",
    client_uri: process.env.NEXT_PUBLIC_BASE_URL,
    dpop_bound_access_tokens: true,
    grant_types: ["authorization_code", "refresh_token"],
    jwks_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/jwks.json`,
    logo_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    redirect_uris: [`${process.env.NEXT_PUBLIC_BASE_URL}/authorize`],
    response_types: ["code"],
    scope: SCOPES.join(" "),
    token_endpoint_auth_method: "none",
  };
}

async function getKeyset() {
  return await Promise.all([
    JoseKey.fromImportable(
      String(process.env.ATPROTO_OAUTH_PRIVATE_KEY_1 ?? ""),
      "key1",
    ),
    JoseKey.fromImportable(
      String(process.env.ATPROTO_OAUTH_PRIVATE_KEY_2 ?? ""),
      "key2",
    ),
    JoseKey.fromImportable(
      String(process.env.ATPROTO_OAUTH_PRIVATE_KEY_3 ?? ""),
      "key3",
    ),
  ]);
}

// Initialize the OAuth client
async function getOAuthClient(
  sessionStore: NodeSavedSessionStore,
  stateStore: NodeSavedStateStore,
): Promise<NodeOAuthClient> {
  if (!oauthClient) {
    const clientMetadata = getClientMetadata();

    // eslint-disable-next-line require-atomic-updates
    oauthClient = new NodeOAuthClient({
      // This object will be used to build the payload of the /client-metadata.json
      // endpoint metadata, exposing the client metadata to the OAuth server.
      clientMetadata,

      // Used to authenticate the client to the token endpoint. Will be used to
      // build the jwks object to be exposed on the "jwks_uri" endpoint.
      keyset: await getKeyset(),

      // Interface to store authenticated session data
      sessionStore,

      // Interface to store authorization state data (during authorization flows)
      stateStore,

      // A lock to prevent concurrent access to the session store. Optional if only one instance is running.
      // requestLock,
    });
  }

  return oauthClient;
}

// Get a valid session for making API calls
async function getValidSession(
  credentials: BlueskyCredentials,
  accessToken: string,
): Promise<OAuthSession> {
  const client = await getOAuthClient(credentials);

  return await client.restore(accessToken);
}

// Create an Agent for making API calls
async function createAgent(
  credentials: BlueskyCredentials,
  accessToken: string,
): Promise<Agent> {
  return new Agent(await getValidSession(credentials, accessToken));
}

// Check if we have a valid session
async function hasValidSession(
  credentials: BlueskyCredentials,
  accessToken: string,
): Promise<boolean> {
  try {
    const client = await getOAuthClient(credentials);

    await client.restore(accessToken);

    return true;
  } catch {
    return false;
  }
}

async function getAuthorizationUrl(
  username: string,
  sessionStore: NodeSavedSessionStore,
  stateStore: NodeSavedStateStore,
): Promise<string> {
  try {
    console.log("Starting OAuth flow for:", username);

    const client = await getOAuthClient(sessionStore, stateStore);

    // The library handles all the complexity (PAR, DPoP, PKCE, etc.)
    const authUrl = await client.authorize(username, {
      scope: SCOPES.join(" "),
    });

    console.log("Authorization URL generated:", authUrl.toString());
    return authUrl.toString();
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Auth URL failed";
    console.error("Error creating authorization URL:", err);
    throw new Error(`Failed to create authorization URL: ${errMessage}`);
  }
}

export {
  createAgent,
  getAuthorizationUrl,
  getClientMetadata,
  getKeyset,
  hasValidSession,
};
