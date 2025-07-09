import type { PinataCredentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: PinataCredentials) {
  return JSON.stringify(credentials);
}

function hasCompleteCredentials(credentials: PinataCredentials) {
  return (
    credentials.apiKey !== "" &&
    credentials.apiSecret !== "" &&
    credentials.jwt !== ""
  );
}

// -----------------------------------------------------------------------------

export { getCredentialsId, hasCompleteCredentials };
