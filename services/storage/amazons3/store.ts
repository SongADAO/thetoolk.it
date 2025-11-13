import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { DEBUG_STORAGE } from "@/config/constants";
import { sleep } from "@/lib/utils";
import type { HLSFiles } from "@/lib/video/hls-converter";
import type { AmazonS3Credentials } from "@/services/storage/types";

interface UploadFileProps {
  credentials: AmazonS3Credentials;
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
      console.log("Test S3: uploadFile");
      await sleep(5000);
      setStoreProgress(100);
      setStoreStatus("Success");
      return "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/gu, "_");
    const filename = `thetoolkit/${timestamp}-${sanitizedFileName}`;

    // Convert file to ArrayBuffer for browser compatibility
    setStoreStatus("Buffering media...");
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    setStoreStatus(`Uploading ${serviceLabel} media...`);

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

      // Create the upload command
      const command = new PutObjectCommand({
        Body: uint8Array,
        Bucket: credentials.bucket,
        ContentLength: file.size,
        ContentType: file.type,
        Key: filename,
        // Note: ACL removed - use bucket policy for public access instead
      });

      // Execute the upload
      response = await s3Client.send(command);
    } catch (err: unknown) {
      console.error("S3 upload failed:", err);
      const errName = err instanceof Error ? err.name : "no-name";
      const errMessage = err instanceof Error ? err.message : "Upload failed";

      // Provide more specific error messages
      if (errName === "CredentialsError") {
        throw new Error(
          "Invalid AWS credentials. Please check your Access Key ID and Secret Access Key.",
          { cause: err },
        );
      }

      if (errName === "NoSuchBucket") {
        throw new Error(
          `S3 bucket "${credentials.bucket}" does not exist or is not accessible.`,
          { cause: err },
        );
      }

      if (errName === "AccessDenied") {
        throw new Error(
          "Access denied. Please check your AWS permissions and bucket policy.",
          { cause: err },
        );
      }

      throw new Error(`Failed to upload to S3: ${errMessage}`, { cause: err });
    }

    // Clear the progress interval
    clearInterval(progressInterval);

    // Construct the public URL
    const publicUrl = `https://${credentials.bucket}.s3.${credentials.region}.amazonaws.com/${filename}`;

    console.log("S3 upload successful:", response);
    console.log("Public URL:", publicUrl);

    setStoreProgress(100);
    setStoreStatus("Success");

    return publicUrl;
  } catch (err: unknown) {
    console.error("S3 upload error:", err);

    const errMessage = err instanceof Error ? err.message : "Upload failed";
    setStoreError(`Upload failed for ${serviceLabel}: ${errMessage}`);
    setStoreStatus(`Upload failed for ${serviceLabel}`);
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
  credentials: AmazonS3Credentials;
  file: File;
  serviceLabel: string;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreStatus: (status: string) => void;
  setStoreProgress: (progress: number) => void;
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
  credentials: AmazonS3Credentials;
  data: object;
  serviceLabel: string;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreStatus: (status: string) => void;
  setStoreProgress: (progress: number) => void;
}

async function uploadJson({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  credentials,
  data,
  serviceLabel,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
  /* eslint-enable @typescript-eslint/no-unused-vars */
}: Readonly<UploadJsonProps>): Promise<string> {
  throw new Error(`Not implemented`);

  return Promise.resolve("");

  // if (DEBUG_STORAGE) {
  //   console.log("Test S3: uploadJson");
  //   await sleep(5000);
  //   return "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
  // }

  // return uploadFile({
  //   credentials,
  //   data,
  //   serviceLabel,,
  //   setIsStoring,
  //   setStoreError,
  //   setStoreProgress,
  //   setStoreStatus,
  // });
}

interface UploadHLSFolderProps {
  credentials: AmazonS3Credentials;
  folderName?: string;
  hlsFiles: HLSFiles;
  serviceLabel: string;
  setIsStoring: (isStoring: boolean) => void;
  setStoreError: (error: string) => void;
  setStoreProgress: (progress: number) => void;
  setStoreStatus: (status: string) => void;
}

async function uploadHLSFolder({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  credentials,
  folderName,
  hlsFiles,
  serviceLabel,
  setIsStoring,
  setStoreError,
  setStoreProgress,
  setStoreStatus,
  /* eslint-enable @typescript-eslint/no-unused-vars */
}: Readonly<UploadHLSFolderProps>): Promise<string> {
  throw new Error(`Not implemented`);

  return Promise.resolve("");

  // try {
  //   const pinata = new PinataSDK({
  //     pinataJwt: credentials.jwt,
  //   });

  //   // Create a folder structure for upload
  //   const files: File[] = [];

  //   // Add manifest file
  //   files.push(hlsFiles.manifest);

  //   // Add thumbnail
  //   files.push(hlsFiles.thumbnail);

  //   // Add all segment files
  //   files.push(...hlsFiles.segments);

  //   console.log(`Uploading HLS folder with ${files.length} files:`, {
  //     manifest: hlsFiles.manifest.name,
  //     thumbnail: hlsFiles.thumbnail.name,
  //     segments: hlsFiles.segments.length,
  //   });

  //   // Upload folder to Pinata using the new SDK
  //   const uploadResult = await pinata.upload.public
  //     .fileArray(files)
  //     .name(folderName ?? `hls-video-${Date.now()}`)
  //     .keyvalues({
  //       type: "hls-video",
  //       files: files.length.toString(),
  //       segments: hlsFiles.segments.length.toString(),
  //     });

  //   console.log("HLS folder uploaded successfully:", uploadResult);

  //   // Construct URLs
  //   // const baseUrl = `https://${this.pinata.config.pinataGateway}/ipfs/${uploadResult.cid}`;
  //   const baseUrl = `ipfs://${uploadResult.cid}`;
  //   const playlistUrl = `${baseUrl}/${hlsFiles.manifest.name}`;
  //   const thumbnailUrl = `${baseUrl}/${hlsFiles.thumbnail.name}`;

  //   return {
  //     playlistUrl,
  //     thumbnailUrl,
  //   };
  // } catch (err: unknown) {
  //   const errMessage = err instanceof Error ? err.message : "HLS Upload failed";
  //   console.error("Failed to upload HLS folder to Pinata:", errMessage);
  //   throw new Error(`HLS upload failed: ${errMessage}`);
  // }
}

export { uploadFile, uploadHLSFolder, uploadJson, uploadVideo };
