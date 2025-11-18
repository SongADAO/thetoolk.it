import { PinataSDK } from "pinata";

import { DEBUG_STORAGE } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { HLSFiles } from "@/lib/video/hls";
import type { PinataCredentials } from "@/services/storage/types";

const HOSTED_CREDENTIALS = {
  apiKey: String(process.env.PINATA_API_KEY ?? ""),
  apiSecret: String(process.env.PINATA_API_SECRET ?? ""),
  gateway: String(process.env.NEXT_PUBLIC_PINATA_API_GATEWAY ?? ""),
  jwt: String(process.env.PINATA_API_JWT ?? ""),
};

// Ensure the gateway URL is sanitized
function sanitizeGateway(gateway: string): string {
  // Remove https:// prefix and trailing slash
  return gateway.replace(/^https:\/\//u, "").replace(/\/$/u, "");
}

async function createSignedVideoURL(): Promise<string> {
  const pinata = new PinataSDK({
    pinataJwt: HOSTED_CREDENTIALS.jwt,
  });

  // Create a signed upload URL using Pinata's signed upload functionality
  return await pinata.upload.public.createSignedURL({
    expires: 60,
    maxFileSize: 500 * 1024 * 1024,
    mimeTypes: ["video/mp4"],
  });
}

async function createSignedJsonURL(): Promise<string> {
  const pinata = new PinataSDK({
    pinataJwt: HOSTED_CREDENTIALS.jwt,
  });

  // Create a signed upload URL using Pinata's signed upload functionality
  return await pinata.upload.public.createSignedURL({
    expires: 60,
    maxFileSize: 1 * 1024,
    mimeTypes: ["application/json"],
  });
}

async function createSignedHLSFolderURL(): Promise<string> {
  const pinata = new PinataSDK({
    pinataJwt: HOSTED_CREDENTIALS.jwt,
  });

  // Create a signed upload URL for multiple files (folder structure)
  return await pinata.upload.public.createSignedURL({
    expires: 60,
    maxFileSize: 500 * 1024 * 1024,
    // Allow video segments, manifests, and thumbnails
    mimeTypes: [
      "directory",
      "video/mp4",
      // .ts files
      "video/MP2T",
      // .m3u8 files
      "application/vnd.apple.mpegurl",
      // alternative for .m3u8
      "application/x-mpegURL",
      // sometimes .m3u8 files are served as text/plain
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  });
}

interface UploadFileWithPresignedProps {
  file: File;
  serviceLabel: string;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
}

async function uploadVideoWithPresignedURL({
  file,
  serviceLabel,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
}: Readonly<UploadFileWithPresignedProps>): Promise<string> {
  try {
    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("Preparing media for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Presigned Upload (Fetch): uploadFileWithPresigned");
      await sleep(2000);
      setProcessProgress(50);
      setProcessStatus("Getting upload URL...");
      await sleep(2000);
      setProcessProgress(100);
      setProcessStatus("Success");
      return "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
    }

    // Step 1: Get presigned upload URL
    setProcessStatus("Getting upload authorization...");
    setProcessProgress(10);

    const presignedResponse = await fetch(
      "/api/hosted/pinata/upload/presigned-video",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json();
      throw new Error(errorData.error ?? "Failed to get upload authorization");
    }

    const { url } = await presignedResponse.json();

    setProcessProgress(25);
    setProcessStatus(`Uploading ${serviceLabel} media...`);

    // Step 2: Upload using fetch
    const formData = new FormData();
    formData.append("file", file);

    // Since fetch doesn't provide upload progress natively, we'll simulate it
    const startTime = Date.now();
    const fileSize = file.size;

    // Start progress simulation
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      // Rough estimate
      const estimatedTime = Math.max(5000, fileSize / 100000);
      // 25% to 90%
      const progress = Math.min((elapsedTime / estimatedTime) * 65, 65);
      setProcessProgress(25 + Math.round(progress));
      setProcessStatus(
        `Uploading ${serviceLabel} media... ${25 + Math.round(progress)}%`,
      );
    }, 500);

    const uploadResponse = await fetch(url, {
      body: formData,
      method: "POST",
    });

    clearInterval(progressInterval);

    if (!uploadResponse.ok) {
      throw new Error(
        `Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`,
      );
    }

    setProcessProgress(95);
    setProcessStatus("Finalizing upload...");

    // Parse response to get CID
    const response = await uploadResponse.json();

    if (!response.data.cid) {
      throw new Error("No CID returned from upload response");
    }

    const { cid } = response.data;

    const contentUri = `https://${sanitizeGateway(HOSTED_CREDENTIALS.gateway)}/ipfs/${cid}`;

    setProcessProgress(100);
    setProcessStatus("Success");

    return contentUri;
  } catch (err: unknown) {
    console.error("Presigned upload error:", err);

    const errMessage = err instanceof Error ? err.message : "Upload failed";
    setProcessError(`Upload failed for ${serviceLabel}: ${errMessage}`);
    setProcessStatus(`Upload failed for ${serviceLabel}`);

    return "";
  } finally {
    setIsProcessing(false);
  }
}

interface UploadHLSFolderWithPresignedProps {
  folderName?: string;
  hlsFiles: HLSFiles;
  serviceLabel: string;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
}

async function uploadHLSFolderWithPresignedURL({
  folderName,
  hlsFiles,
  serviceLabel,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
}: Readonly<UploadHLSFolderWithPresignedProps>): Promise<string> {
  try {
    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("Preparing HLS files for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Presigned HLS Upload: uploadHLSFolderWithPresignedURL");
      await sleep(2000);
      setProcessProgress(50);
      setProcessStatus("Getting upload URL...");
      await sleep(2000);
      setProcessProgress(100);
      setProcessStatus("Success");
      return `https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8`;
    }

    // Step 1: Get presigned upload URL for folder
    setProcessStatus("Getting upload authorization...");
    setProcessProgress(10);

    const presignedResponse = await fetch(
      "/api/hosted/pinata/upload/presigned-hls",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json();
      throw new Error(errorData.error ?? "Failed to get upload authorization");
    }

    const { url } = await presignedResponse.json();

    setProcessProgress(25);
    setProcessStatus(`Uploading ${serviceLabel} HLS files...`);

    // Step 2: Prepare all files for upload
    const files: File[] = [];

    // Add master manifest file (this is what will be referenced)
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

    // Step 3: Create FormData with all files
    const formData = new FormData();

    // Add each file to the form data
    files.forEach((file) => {
      formData.append("file", file);
    });

    // Add metadata for the folder upload
    if (folderName) {
      formData.append("name", folderName);
    } else {
      formData.append("name", `hls-video-${Date.now()}`);
    }

    // Add key-value metadata
    formData.append(
      "keyvalues",
      JSON.stringify({
        files: files.length.toString(),
        segments: hlsFiles.segments.length.toString(),
        type: "hls-video",
      }),
    );

    // Step 4: Calculate total file size for progress estimation
    const totalFileSize = files.reduce((total, file) => total + file.size, 0);
    const startTime = Date.now();

    // Start progress simulation
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      // Estimate based on total file size
      // Slower for multiple files
      const estimatedTime = Math.max(10000, totalFileSize / 50000);
      // 25% to 90%
      const progress = Math.min((elapsedTime / estimatedTime) * 65, 65);
      setProcessProgress(25 + Math.round(progress));
      setProcessStatus(
        `Uploading ${serviceLabel} HLS files... ${25 + Math.round(progress)}%`,
      );
    }, 500);

    const uploadResponse = await fetch(url, {
      body: formData,
      method: "POST",
    });

    clearInterval(progressInterval);

    if (!uploadResponse.ok) {
      throw new Error(
        `HLS Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`,
      );
    }

    setProcessProgress(95);
    setProcessStatus("Finalizing HLS upload...");

    // Parse response to get CID
    const response = await uploadResponse.json();

    if (!response.data.cid) {
      throw new Error("No CID returned from HLS upload response");
    }

    const { cid } = response.data;

    // Construct the playlist URL (same as original function)
    const baseUrl = `https://${sanitizeGateway(HOSTED_CREDENTIALS.gateway)}/ipfs/${cid}`;
    const playlistUrl = `${baseUrl}/${hlsFiles.masterManifest.name}`;

    console.log("HLS folder uploaded successfully:", {
      baseUrl,
      cid,
      playlistUrl,
    });

    setProcessProgress(100);
    setProcessStatus("Success");

    return playlistUrl;
  } catch (err: unknown) {
    console.error("Presigned HLS upload error:", err);

    const errMessage = err instanceof Error ? err.message : "HLS Upload failed";
    setProcessError(`HLS Upload failed for ${serviceLabel}: ${errMessage}`);
    setProcessStatus(`HLS Upload failed for ${serviceLabel}`);

    return "";
  } finally {
    setIsProcessing(false);
  }
}

interface UploadFileProps {
  credentials: PinataCredentials;
  file: File;
  serviceLabel: string;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
}
async function uploadFile({
  credentials,
  file,
  serviceLabel,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
}: Readonly<UploadFileProps>): Promise<string> {
  let progressInterval = null;

  try {
    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("Preparing media for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Pinata: uploadFile");
      await sleep(5000);
      setProcessProgress(100);
      setProcessStatus("Success");
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
      setProcessProgress(Math.round(progress));
      setProcessStatus(
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
    const contentUri = `https://${sanitizeGateway(credentials.gateway)}/ipfs/${upload.cid}`;

    setProcessProgress(100);
    setProcessStatus("Success");

    return contentUri;
  } catch (err: unknown) {
    console.error("Pinata upload error:", err);

    const errMessage = err instanceof Error ? err.message : "Upload failed";
    setProcessError(`Upload failed for ${serviceLabel}: ${errMessage}`);
    setProcessStatus(`Upload failed for ${serviceLabel}`);
  } finally {
    setIsProcessing(false);
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
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessStatus: (status: string) => void;
  setProcessProgress: (progress: number) => void;
  serviceLabel: string;
}
async function uploadVideo({
  credentials,
  file,
  serviceLabel,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
}: Readonly<UploadVideoProps>): Promise<string> {
  return uploadFile({
    credentials,
    file,
    serviceLabel,
    setIsProcessing,
    setProcessError,
    setProcessProgress,
    setProcessStatus,
  });
}

interface UploadJsonProps {
  credentials: PinataCredentials;
  data: object;
  serviceLabel: string;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
}
async function uploadJson({
  credentials,
  data,
  serviceLabel,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
}: Readonly<UploadJsonProps>): Promise<string> {
  try {
    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("Preparing media for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Pinata: uploadJson");
      await sleep(5000);
      setProcessProgress(100);
      setProcessStatus("Success");
      return "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
    }

    setProcessStatus(`Uploading ${serviceLabel} json...`);

    const pinata = new PinataSDK({
      pinataJwt: credentials.jwt,
    });

    // Pin metadata JSON to Pinata
    const upload = await pinata.upload.public.json(data);

    // const contentUri = `ipfs://${upload.cid}`;
    // const contentUri = `https://ipfs.io/ipfs/${upload.cid}`;
    const contentUri = `https://${sanitizeGateway(credentials.gateway)}/ipfs/${upload.cid}`;

    setProcessProgress(100);
    setProcessStatus("Success");

    return contentUri;
  } catch (err: unknown) {
    console.error("Pinata upload error:", err);

    const errMessage = err instanceof Error ? err.message : "Upload failed";
    setProcessError(`Upload failed: ${errMessage}`);
    setProcessStatus("Upload failed");
  } finally {
    setIsProcessing(false);
  }

  return "";
}

interface UploadHLSFolderProps {
  credentials: PinataCredentials;
  folderName?: string;
  hlsFiles: HLSFiles;
  serviceLabel: string;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
}
async function uploadHLSFolder({
  credentials,
  folderName,
  hlsFiles,
  serviceLabel,
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
}: Readonly<UploadHLSFolderProps>): Promise<string> {
  let progressInterval = null;

  try {
    setIsProcessing(true);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("Preparing HLS files for upload...");

    if (DEBUG_STORAGE) {
      console.log("Test Pinata: uploadHLSFolder");
      await sleep(5000);
      setProcessProgress(100);
      setProcessStatus("Success");
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
      setProcessProgress(Math.round(progress));
      setProcessStatus(
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
    const baseUrl = `https://${sanitizeGateway(credentials.gateway)}/ipfs/${uploadResult.cid}`;
    const playlistUrl = `${baseUrl}/${hlsFiles.masterManifest.name}`;
    // const thumbnailUrl = `${baseUrl}/${hlsFiles.thumbnail.name}`;

    setProcessProgress(100);
    setProcessStatus("Success");

    return playlistUrl;
  } catch (err: unknown) {
    console.error("Pinata HLS Upload error:", err);

    const errMessage = err instanceof Error ? err.message : "HLS Upload failed";
    setProcessError(`HLS Upload failed: ${errMessage}`);
    setProcessStatus("HLS Upload failed");
  } finally {
    setIsProcessing(false);
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  return "";
}

export {
  createSignedHLSFolderURL,
  createSignedJsonURL,
  createSignedVideoURL,
  HOSTED_CREDENTIALS,
  uploadFile,
  uploadHLSFolder,
  uploadHLSFolderWithPresignedURL,
  uploadJson,
  uploadVideo,
  uploadVideoWithPresignedURL,
};
