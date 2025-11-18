import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthCredentials,
  OauthExpiration,
  PostServiceAccount,
} from "@/services/post/types";

const HOSTED_CREDENTIALS: OauthCredentials = {
  clientId: String(process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID ?? ""),
  clientSecret: String(process.env.NEYNAR_CLIENT_SECRET ?? ""),
  serviceUrl: "",
  username: "",
};

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: OauthCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: OauthCredentials): boolean {
  return credentials.clientId !== "" && credentials.clientSecret !== "";
}

function hasCompleteAuthorization(expiration: OauthExpiration): boolean {
  return expiration.refreshTokenExpiresAt !== "";
}

function getAuthorizationExpiresAt(expiration: OauthExpiration): string {
  return expiration.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
async function getAccounts(token: string): Promise<PostServiceAccount[]> {
  return Promise.resolve([]);
}

// -----------------------------------------------------------------------------

async function setAuthorizationHosted(
  authorization: OauthAuthorization | null,
  expiration: OauthExpiration,
  accounts: PostServiceAccount[],
) {
  const response = await fetch("/api/hosted/neynar/store-auth", {
    body: JSON.stringify({
      accounts,
      authorization,
      expiration,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to store authorization");
  }
}

// -----------------------------------------------------------------------------

export {
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  setAuthorizationHosted,
};
