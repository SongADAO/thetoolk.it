import { PinataSDK } from "pinata";

import { DEBUG_STORAGE } from "@/app/config/constants";
import type { HLSFiles } from "@/app/lib/hls-converter";
import { sleep } from "@/app/lib/utils";
import type { PinataCredentials } from "@/app/services/storage/types";

interface UploadFileProps {
  credentials: PinataCredentials;
  file: File;
  serviceLabel: string;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreProgress: (progress: number) => void;
  setStoreStatus: (status: string) => void;
}
async function uploadFile({
  credentials,
  file,
  serviceLabel,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadFileProps>): Promise<string> {
  let progressInterval = null;

  try {
    setIsStoring(true);
    setStoreError("");
    setStoreProgress(0);
    setStoreStatus("Preparing media for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Pinata: uploadFile");
      await sleep(5000);
      setStoreProgress(100);
      setStoreStatus("Success");
      return "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
    }

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
      setStoreProgress(Math.round(progress));
      setStoreStatus(
        `Uploading ${serviceLabel} media... ${Math.round(progress)}%`,
      );
    }, 500);

    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    const upload = await pinata.upload.public.file(file);

    // Clear the progress interval
    clearInterval(progressInterval);

    // const contentUri = `ipfs://${upload.cid}`;
    // const contentUri = `https://ipfs.io/ipfs/${upload.cid}`;
    const contentUri = `https://${credentials.gateway}/ipfs/${upload.cid}`;

    setStoreProgress(100);
    setStoreStatus("Success");

    return contentUri;
  } catch (err: unknown) {
    console.error("Pinata upload error:", err);

    const errMessage = err instanceof Error ? err.message : "Upload failed";
    setStoreError(`Upload failed: ${errMessage}`);
    setStoreStatus("Upload failed");
  } finally {
    setIsStoring(false);
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  return "";
}

interface UploadVideoProps {
  credentials: PinataCredentials;
  file: File;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreStatus: (status: string) => void;
  setStoreProgress: (progress: number) => void;
  serviceLabel: string;
}
async function uploadVideo({
  credentials,
  file,
  serviceLabel,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadVideoProps>): Promise<string> {
  return uploadFile({
    credentials,
    file,
    serviceLabel,
    setIsStoring,
    setStoreError,
    setStoreProgress,
    setStoreStatus,
  });
}

interface UploadJsonProps {
  credentials: PinataCredentials;
  data: object;
  serviceLabel: string;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreProgress: (progress: number) => void;
  setStoreStatus: (status: string) => void;
}
async function uploadJson({
  credentials,
  data,
  serviceLabel,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadJsonProps>): Promise<string> {
  try {
    setIsStoring(true);
    setStoreError("");
    setStoreProgress(0);
    setStoreStatus("Preparing media for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Pinata: uploadJson");
      await sleep(5000);
      setStoreProgress(100);
      setStoreStatus("Success");
      return "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
    }

    setStoreStatus(`Uploading ${serviceLabel} json...`);

    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    // Pin metadata JSON to Pinata
    const upload = await pinata.upload.public.json(data);

    // const contentUri = `ipfs://${upload.cid}`;
    // const contentUri = `https://ipfs.io/ipfs/${upload.cid}`;
    const contentUri = `https://${credentials.gateway}/ipfs/${upload.cid}`;

    setStoreProgress(100);
    setStoreStatus("Success");

    return contentUri;
  } catch (err: unknown) {
    console.error("Pinata upload error:", err);

    const errMessage = err instanceof Error ? err.message : "Upload failed";
    setStoreError(`Upload failed: ${errMessage}`);
    setStoreStatus("Upload failed");
  } finally {
    setIsStoring(false);
  }

  return "";
}

interface UploadHLSFolderProps {
  credentials: PinataCredentials;
  folderName?: string;
  hlsFiles: HLSFiles;
  serviceLabel: string;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreProgress: (progress: number) => void;
  setStoreStatus: (status: string) => void;
}
async function uploadHLSFolder({
  credentials,
  folderName,
  hlsFiles,
  serviceLabel,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadHLSFolderProps>): Promise<string> {
  let progressInterval = null;

  try {
    setIsStoring(true);
    setStoreError("");
    setStoreProgress(0);
    setStoreStatus("Preparing HLS files for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Pinata: uploadHLSFolder");
      await sleep(5000);
      setStoreProgress(100);
      setStoreStatus("Success");
      return `https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8`;
      // return `https://plum-cooperative-bobcat-432.mypinata.cloud/ipfs/bafybeig3a55gounmtzgklm5v6dxfu4vab6frmocz3ncurao4d2yxcr3fcy/video.m3u8`;
    }

    // For progress tracking, we'll use a different approach
    // The AWS SDK doesn't provide built-in progress for browser uploads
    // So we'll simulate progress based on file size and time
    const startTime = Date.now();
    const fileSize =
      hlsFiles.masterManifest.size +
      hlsFiles.streamManifest.size +
      hlsFiles.thumbnail.size +
      hlsFiles.segments
        .map((segment) => segment.size)
        .reduce((a, b) => a + b, 0);

    // Start a progress simulation
    progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      // Estimate based on file size
      const estimatedTime = Math.max(5000, fileSize / 100000);
      const progress = Math.min((elapsedTime / estimatedTime) * 100, 95);
      // S3 upload is 30% of total
      setStoreProgress(Math.round(progress));
      setStoreStatus(
        `Uploading ${serviceLabel} media... ${Math.round(progress)}%`,
      );
    }, 500);

    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    // Create a folder structure for upload
    const files: File[] = [];

    // Add master manifest file (this is what Farcaster will reference)
    files.push(hlsFiles.masterManifest);

    // Add manifest file
    files.push(hlsFiles.streamManifest);

    // Add thumbnail
    files.push(hlsFiles.thumbnail);

    // Add all segment files
    files.push(...hlsFiles.segments);

    console.log(`Uploading HLS folder with ${files.length} files:`, {
      masterManifest: hlsFiles.masterManifest.name,
      segments: hlsFiles.segments.length,
      streamManifest: hlsFiles.streamManifest.name,
      thumbnail: hlsFiles.thumbnail.name,
    });

    // Upload folder to Pinata using the new SDK
    const uploadResult = await pinata.upload.public
      .fileArray(files)
      .name(folderName ?? `hls-video-${Date.now()}`)
      .keyvalues({
        files: files.length.toString(),
        segments: hlsFiles.segments.length.toString(),
        type: "hls-video",
      });

    // Clear the progress interval
    clearInterval(progressInterval);

    console.log("HLS folder uploaded successfully:", uploadResult);

    // Construct URLs
    // const baseUrl = `https://${this.pinata.config.pinataGateway}/ipfs/${uploadResult.cid}`;
    // const baseUrl = `ipfs://${uploadResult.cid}`;
    // const baseUrl = `https://ipfs.io/ipfs/${uploadResult.cid}`;
    const baseUrl = `https://${credentials.gateway}/ipfs/${uploadResult.cid}`;
    const playlistUrl = `${baseUrl}/${hlsFiles.masterManifest.name}`;
    // const thumbnailUrl = `${baseUrl}/${hlsFiles.thumbnail.name}`;

    setStoreProgress(100);
    setStoreStatus("Success");

    return playlistUrl;
  } catch (err: unknown) {
    console.error("Pinata HLS Upload error:", err);

    const errMessage = err instanceof Error ? err.message : "HLS Upload failed";
    setStoreError(`HLS Upload failed: ${errMessage}`);
    setStoreStatus("HLS Upload failed");
  } finally {
    setIsStoring(false);
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  return "";
}

export { uploadFile, uploadHLSFolder, uploadJson, uploadVideo };
