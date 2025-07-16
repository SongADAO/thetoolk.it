import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { HLSFiles, HLSUploadResult } from "@/app/lib/hls-converter";
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
    const filename = `thetoolkit/${timestamp}-${sanitizedFileName}`;

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

  // return uploadFile({
  //   credentials,
  //   data,
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
  throw new Error(`Not implemented`);

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
