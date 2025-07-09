import { hasExpired } from "@/app/services/post/helpers";
import type {
  OauthAuthorization,
  OauthCredentials,
  ServiceAccount,
} from "@/app/services/post/types";

// -----------------------------------------------------------------------------

function hasTokenExpired(tokenExpiry: string | null): boolean {
  // 5 minutes buffer
  return hasExpired(tokenExpiry, 5 * 60);
}

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: OauthCredentials): string {
  return JSON.stringify(credentials);
}

function hasCompleteCredentials(credentials: OauthCredentials): boolean {
  // return credentials.clientId !== "" && credentials.clientSecret !== "";
  return credentials.clientId !== "";
}

function hasCompleteAuthorization(authorization: OauthAuthorization): boolean {
  return (
    authorization.accessToken !== "" &&
    authorization.accessTokenExpiresAt !== "" &&
    authorization.refreshToken !== "" &&
    authorization.refreshTokenExpiresAt !== "" &&
    !hasTokenExpired(authorization.refreshTokenExpiresAt)
  );
}

function getAuthorizationExpiresAt(authorization: OauthAuthorization): string {
  return authorization.refreshTokenExpiresAt;
}

// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
async function getAccounts(token: string): Promise<ServiceAccount[]> {
  return [];
}

// -----------------------------------------------------------------------------

export {
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
};
