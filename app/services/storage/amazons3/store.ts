import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { AmazonS3Credentials } from "@/app/services/storage/types";

interface UploadFileProps {
  credentials: AmazonS3Credentials;
  file: File;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreProgress: (progress: number) => void;
  setStoreStatus: (status: string) => void;
}
async function uploadFile({
  credentials,
  file,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadFileProps>): Promise<string | null> {
  let progressInterval = null;

  try {
    setIsStoring(true);
    setStoreError("");
    setStoreProgress(0);
    setStoreStatus("Preparing file for upload...");

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/gu, "_");
    const filename = `instagram-videos/${timestamp}-${sanitizedFileName}`;

    // Convert file to ArrayBuffer for browser compatibility
    setStoreStatus("Buffering file...");
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    setStoreStatus("Uploading video to S3...");

    // For progress tracking, we'll use a different approach
    // The AWS SDK doesn't provide built-in progress for browser uploads
    // So we'll simulate progress based on file size and time
    const startTime = Date.now();
    const fileSize = file.size;

    // Start a progress simulation
    progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      // Estimate based on file size
      const estimatedTime = Math.max(5000, fileSize / 100000);
      const progress = Math.min((elapsedTime / estimatedTime) * 100, 95);
      // S3 upload is 30% of total
      setStoreProgress(Math.round(progress * 0.3));
      setStoreStatus(`Uploading to S3... ${Math.round(progress)}%`);
    }, 500);

    let response = null;
    try {
      // Create S3 client
      const s3Client = new S3Client({
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
        region: credentials.region,
      });

      // Upload parameters - use Uint8Array instead of File object
      const uploadParams = {
        Body: uint8Array,
        Bucket: credentials.bucket,
        ContentLength: file.size,
        ContentType: file.type,
        Key: filename,
        // Note: ACL removed - use bucket policy for public access instead
      };

      // Create the upload command
      const command = new PutObjectCommand(uploadParams);

      // Execute the upload
      response = await s3Client.send(command);
    } catch (err: unknown) {
      console.error("S3 upload error:", err);
      const errName = err instanceof Error ? err.name : "no-name";
      const errMessage = err instanceof Error ? err.message : "Upload failed";

      // Provide more specific error messages
      if (errName === "CredentialsError") {
        throw new Error(
          "Invalid AWS credentials. Please check your Access Key ID and Secret Access Key.",
        );
      }

      if (errName === "NoSuchBucket") {
        throw new Error(
          `S3 bucket "${credentials.bucket}" does not exist or is not accessible.`,
        );
      }

      if (errName === "AccessDenied") {
        throw new Error(
          "Access denied. Please check your AWS permissions and bucket policy.",
        );
      }

      throw new Error(`Failed to upload to S3: ${errMessage}`);
    }

    // Clear the progress interval
    clearInterval(progressInterval);

    // Complete the progress
    setStoreProgress(30);
    setStoreStatus("S3 upload complete");

    // Construct the public URL
    const publicUrl = `https://${credentials.bucket}.s3.${credentials.region}.amazonaws.com/${filename}`;

    console.log("S3 upload successful:", response);
    console.log("Public URL:", publicUrl);

    return publicUrl;
  } catch (err: unknown) {
    console.error("S3 upload error:", err);
    const errMessage = err instanceof Error ? err.message : "Upload failed";

    setStoreError(`Upload failed: ${errMessage}`);
    setStoreStatus("❌ Upload failed");
  } finally {
    setIsStoring(false);
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  return null;
}

interface UploadVideoProps {
  credentials: AmazonS3Credentials;
  file: File;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreStatus: (status: string) => void;
  setStoreProgress: (progress: number) => void;
}
async function uploadVideo({
  credentials,
  file,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadVideoProps>): Promise<string | null> {
  return uploadFile({
    credentials,
    file,
    setIsStoring,
    setStoreError,
    setStoreProgress,
    setStoreStatus,
  });
}

interface UploadJsonProps {
  credentials: AmazonS3Credentials;
  data: object;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreStatus: (status: string) => void;
  setStoreProgress: (progress: number) => void;
}
async function uploadJson({
  credentials,
  data,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadJsonProps>): Promise<string | null> {
  return "TODO";

  return uploadFile({
    credentials,
    data,
    setIsStoring,
    setStoreError,
    setStoreProgress,
    setStoreStatus,
  });
}

export { uploadFile, uploadJson, uploadVideo };
