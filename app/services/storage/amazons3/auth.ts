import type { AmazonS3Credentials } from "@/app/services/storage/types";

// -----------------------------------------------------------------------------

function getCredentialsId(credentials: AmazonS3Credentials) {
  return JSON.stringify(credentials);
}

function hasCompleteCredentials(credentials: AmazonS3Credentials) {
  return (
    credentials.accessKeyId !== "" &&
    credentials.bucket !== "" &&
    credentials.region !== "" &&
    credentials.secretAccessKey !== ""
  );
}

// -----------------------------------------------------------------------------

export { getCredentialsId, hasCompleteCredentials };
