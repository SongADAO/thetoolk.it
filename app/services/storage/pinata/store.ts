import { PinataSDK } from "pinata";

import type { HLSFiles, HLSUploadResult } from "@/app/lib/hls-converter";
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

interface UploadHLSFolderProps {
  credentials: PinataCredentials;
  folderName?: string;
  hlsFiles: HLSFiles;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreProgress: (progress: number) => void;
  setStoreStatus: (status: string) => void;
}
async function uploadHLSFolder({
  credentials,
  folderName,
  hlsFiles,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
}: Readonly<UploadHLSFolderProps>): Promise<HLSUploadResult> {
  try {
    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    // Create a folder structure for upload
    const files: File[] = [];

    // Add manifest file
    files.push(hlsFiles.manifest);

    // Add thumbnail
    files.push(hlsFiles.thumbnail);

    // Add all segment files
    files.push(...hlsFiles.segments);

    console.log(`Uploading HLS folder with ${files.length} files:`, {
      manifest: hlsFiles.manifest.name,
      thumbnail: hlsFiles.thumbnail.name,
      segments: hlsFiles.segments.length,
    });

    // Upload folder to Pinata using the new SDK
    const uploadResult = await pinata.upload.public
      .fileArray(files)
      .name(folderName ?? `hls-video-${Date.now()}`)
      .keyvalues({
        type: "hls-video",
        files: files.length.toString(),
        segments: hlsFiles.segments.length.toString(),
      });

    console.log("HLS folder uploaded successfully:", uploadResult);

    // Construct URLs
    // const baseUrl = `https://${this.pinata.config.pinataGateway}/ipfs/${uploadResult.cid}`;
    const baseUrl = `ipfs://${uploadResult.cid}`;
    const playlistUrl = `${baseUrl}/${hlsFiles.manifest.name}`;
    const thumbnailUrl = `${baseUrl}/${hlsFiles.thumbnail.name}`;

    return {
      playlistUrl,
      thumbnailUrl,
      folderHash: uploadResult.cid,
    };
  } catch (error) {
    console.error("Failed to upload HLS folder to Pinata:", error);
    throw new Error(`HLS upload failed: ${error}`);
  }
}

export { uploadFile, uploadHLSFolder, uploadJson, uploadVideo };
