import { PinataSDK } from "pinata";

import type { PinataCredentials } from "@/app/services/storage/types";

interface UploadFileProps {
  credentials: PinataCredentials;
  file: File;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreStatus: (status: string) => void;
  setStoreProgress: (progress: number) => void;
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

    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    const upload = await pinata.upload.public.file(file);

    // Clear the progress interval
    clearInterval(progressInterval);

    const contentUri = `ipfs://${upload.cid}`;

    return contentUri;
  } catch (err: unknown) {
    console.error("Post error:", err);

    const errMessage = err instanceof Error ? err.message : "Post failed";
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
  credentials: PinataCredentials;
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
  credentials: PinataCredentials;
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
  try {
    setIsStoring(true);
    setStoreError("");
    setStoreProgress(0);
    setStoreStatus("Preparing file for upload...");

    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    // Pin metadata JSON to Pinata
    const upload = await pinata.upload.public.json(data);

    const contentUri = `ipfs://${upload.cid}`;

    return contentUri;
  } catch (err: unknown) {
    console.error("Post error:", err);

    const errMessage = err instanceof Error ? err.message : "Post failed";
    setStoreError(`Upload failed: ${errMessage}`);
    setStoreStatus("❌ Upload failed");
  } finally {
    setIsStoring(false);
  }

  return null;
}

export { uploadFile, uploadJson, uploadVideo };
