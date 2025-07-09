import type { AmazonS3Credentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: AmazonS3Credentials): string {
  return JSON.stringify(credentials);
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
