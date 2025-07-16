import { objectIdHash } from "@/app/lib/hash";
import type { PinataCredentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: PinataCredentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: PinataCredentials): boolean {
  return (
    credentials.apiKey !== "" &&
    credentials.apiSecret !== "" &&
    credentials.jwt !== "" &&
    credentials.gateway !== ""
  );
}

// -----------------------------------------------------------------------------

export { getCredentialsId, hasCompleteCredentials };
