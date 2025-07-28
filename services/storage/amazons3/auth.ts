import { objectIdHash } from "@/lib/hash";
import type { AmazonS3Credentials } from "@/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: AmazonS3Credentials): string {
  return objectIdHash(credentials);
}

function hasCompleteCredentials(credentials: AmazonS3Credentials): boolean {
  return (
    credentials.accessKeyId !== "" &&
    credentials.bucket !== "" &&
    credentials.region !== "" &&
    credentials.secretAccessKey !== ""
  );
}

// -----------------------------------------------------------------------------

export { getCredentialsId, hasCompleteCredentials };
