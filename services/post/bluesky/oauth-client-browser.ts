import { Agent } from "@atproto/api";
import {
  BrowserOAuthClient,
  type OAuthSession,
} from "@atproto/oauth-client-browser";

import type { BlueskyCredentials } from "@/services/post/types";

const SCOPES: string[] = ["atproto", "transition:generic"];

// OAuth client instance (singleton)
let oauthClient: BrowserOAuthClient | null = null;

// Client metadata (to be served at your client_id URL)
function getClientMetadata(requestUrl: string) {
  const url = new URL(requestUrl);
  const baseURL = `${url.protocol}//${url.host}`;

  return {
    application_type: "web",
    client_id: `${baseURL}/client-metadata-browser.json`,
    client_name: "The Toolk.it",
    client_uri: baseURL,
    dpop_bound_access_tokens: true,
    grant_types: ["authorization_code", "refresh_token"],
    logo_uri: `${baseURL}/logo.png`,
    redirect_uris: [`${baseURL}/authorize`],
    response_types: ["code"],
    scope: SCOPES.join(" "),
    token_endpoint_auth_method: "none",
  };
}

// Initialize the OAuth client
async function getOAuthClient(
  credentials: BlueskyCredentials,
  requestUrl: string,
): Promise<BrowserOAuthClient> {
  if (!oauthClient) {
    const clientMetadata = getClientMetadata(requestUrl);

    // eslint-disable-next-line require-atomic-updates
    oauthClient = await BrowserOAuthClient.load({
      clientId: clientMetadata.client_id,
      handleResolver: credentials.serviceUrl,
      // Instead of 'fragment' (default)
      responseMode: "query",
    });
  }

  return oauthClient;
}

// Check if we have a valid session
// async function hasValidSession(
//   credentials: BlueskyCredentials,
//   accessToken: string,
// ): Promise<boolean> {
//   try {
//     const client = await getOAuthClient(credentials);

//     await client.restore(accessToken);

//     return true;
//   } catch {
//     return false;
//   }
// }

// Get a valid session for making API calls
async function getValidSession(
  credentials: BlueskyCredentials,
  accessToken: string,
  requestUrl: string,
): Promise<OAuthSession> {
  const client = await getOAuthClient(credentials, requestUrl);

  return await client.restore(accessToken);
}

// Create an Agent for making API calls
async function createAgent(
  credentials: BlueskyCredentials,
  accessToken: string,
  requestUrl: string,
): Promise<Agent> {
  return new Agent(await getValidSession(credentials, accessToken, requestUrl));
}

export { createAgent, getClientMetadata, getOAuthClient };
