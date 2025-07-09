import { djb2Hash } from "@/app/lib/hash";
import type { AmazonS3Credentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: AmazonS3Credentials): string {
  return djb2Hash(JSON.stringify(credentials));
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
