import { djb2Hash } from "@/app/lib/hash";
import type { PinataCredentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: PinataCredentials): string {
  return djb2Hash(JSON.stringify(credentials));
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
