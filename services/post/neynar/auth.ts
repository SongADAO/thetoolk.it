import { objectIdHash } from "@/lib/hash";
import type {
  OauthAuthorization,
  OauthCredentials,
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

function hasCompleteAuthorization(authorization: OauthAuthorization): boolean {
  return (
    authorization.refreshToken !== "" &&
    authorization.refreshTokenExpiresAt !== ""
  );
}

function getAuthorizationExpiresAt(authorization: OauthAuthorization): string {
  return authorization.refreshTokenExpiresAt;
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
