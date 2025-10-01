import { objectIdHash } from "@/lib/hash";
import type {
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";

const HOSTED_CREDENTIALS = {
  clientId: String(process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID ?? ""),
  clientSecret: String(process.env.NEYNAR_CLIENT_SECRET ?? ""),
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
async function getAccounts(token: string): Promise<ServiceAccount[]> {
  return Promise.resolve([]);
}

// -----------------------------------------------------------------------------

export {
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
};
