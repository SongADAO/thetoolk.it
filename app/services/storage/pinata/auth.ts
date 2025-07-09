import type { PinataCredentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: PinataCredentials): string {
  return JSON.stringify(credentials);
}

function hasCompleteCredentials(credentials: PinataCredentials): boolean {
  return (
    credentials.apiKey !== "" &&
    credentials.apiSecret !== "" &&
    credentials.jwt !== ""
  );
}

// -----------------------------------------------------------------------------

export { getCredentialsId, hasCompleteCredentials };
