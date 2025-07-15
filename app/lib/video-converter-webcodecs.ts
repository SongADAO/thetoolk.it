import { parseMedia } from "@remotion/media-parser";
import { convertMedia } from "@remotion/webcodecs";

export interface ConversionOptions {
  audioBitrate: number;
  audioSampleRate: number;
  crf: number;
  duration: number;
  maxFileSizeMB: number;
  maxWidth: number;
  targetFps: number;
}

export class VideoConverter {
  private initialized = false;

  async initialize(): Promise<void> {
    // Check if WebCodecs is supported
    if (!("VideoEncoder" in window) || !("VideoDecoder" in window)) {
      throw new Error("WebCodecs is not supported in this browser");
    }

    this.initialized = true;
    console.log("VideoConverter initialized with WebCodecs support");
  }

  async convertVideo(
    file: File,
    options: ConversionOptions,
  ): Promise<Uint8Array> {
    if (!this.initialized) {
      throw new Error(
        "VideoConverter not initialized. Call initialize() first.",
      );
    }

    try {
      console.log("Starting video conversion with options:", options);

      // Get video metadata using parseMedia
      const metadata = await parseMedia({
        src: file,
        fields: {
          dimensions: true,
          fps: true,
          durationInSeconds: true,
        },
      });

      console.log("Original video metadata:", metadata);

      // Extract dimensions and fps from metadata
      const { width: originalWidth, height: originalHeight } =
        metadata.dimensions ?? { width: 1920, height: 1080 };
      const originalFps = metadata.fps ?? 30;
      // Calculate target dimensions while maintaining aspect ratio
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (originalWidth > options.maxWidth) {
        const aspectRatio = originalHeight / originalWidth;
        targetWidth = options.maxWidth;
        targetHeight = Math.round(options.maxWidth * aspectRatio);
      }

      // Ensure dimensions are even (required for H.264)
      targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
      targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

      console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);

      // Convert the media using the correct @remotion/webcodecs API
      const result = await convertMedia({
        src: file,
        container: "mp4",
        videoCodec: "h264",
        audioCodec: "aac",
        expectedDurationInSeconds: options.duration,
        expectedFrameRate: Math.min(originalFps, options.targetFps),
        resize:
          targetWidth !== originalWidth || targetHeight !== originalHeight
            ? {
                mode: "scale",
                width: targetWidth,
                height: targetHeight,
              }
            : undefined,
        onProgress: ({ overallProgress }) => {
          console.log(
            `Conversion progress: ${Math.round(overallProgress * 100)}%`,
          );
        },
        onVideoTrack: async ({ track, defaultVideoCodec, canCopyTrack }) =>
          // Use copy if possible and dimensions don't need changing and fps is acceptable
          // if (
          //   canCopyTrack &&
          //   targetWidth === originalWidth &&
          //   targetHeight === originalHeight &&
          //   originalFps <= options.targetFps
          // ) {
          //   return { type: "copy" };
          // }

          // Otherwise re-encode with H.264
          ({
            type: "reencode",
            videoCodec: "h264",
          }),
        onAudioTrack: async ({ track, defaultAudioCodec, canCopyTrack }) =>
          // Re-encode audio to AAC to ensure compatibility with specified bitrate
          ({
            type: "reencode",
            audioCodec: "aac",
            bitrate: options.audioBitrate,
            sampleRate: options.audioSampleRate,
          }),
      });

      // Get the converted buffer
      const blob = await result.save();
      const arrayBuffer = await blob.arrayBuffer();
      const convertedArray = new Uint8Array(arrayBuffer);

      // Check if the file size is within limits
      const fileSizeMB = convertedArray.length / (1024 * 1024);
      console.log(`Converted file size: ${fileSizeMB.toFixed(2)}MB`);

      if (fileSizeMB > options.maxFileSizeMB) {
        console.warn(
          `File size (${fileSizeMB.toFixed(2)}MB) exceeds limit (${options.maxFileSizeMB}MB)`,
        );
        // You might want to implement additional compression logic here
        // For now, we'll return the converted file anyway
      }

      // Clean up resources
      await result.remove();

      return convertedArray;
    } catch (error) {
      console.error("Video conversion error:", error);
      throw new Error(`Video conversion failed: ${error.message}`);
    }
  }

  downloadFile(file: File): void {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Downloaded converted file: ${file.name}`);
  }
}
