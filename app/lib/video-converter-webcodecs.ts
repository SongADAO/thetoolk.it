// First install the dependency:
// npm install @remotion/webcodecs

import {
  canReencodeAudioTrack,
  canReencodeVideoTrack,
  convertMedia,
} from "@remotion/webcodecs";

interface ConversionOptions {
  audioBitrate?: string;
  audioSampleRate?: number;
  crf?: number;
  duration?: number;
  maxFileSizeMB?: number;
  maxWidth?: number;
  targetFps?: number;
}

class VideoConverter {
  private isLoaded = false;

  public constructor() {
    // No initialization needed for @remotion/webcodecs
  }

  // Check if WebCodecs is supported
  public async initialize(
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    if (this.isLoaded) return;

    // Check WebCodecs support
    if (
      !("VideoEncoder" in window) ||
      !("VideoDecoder" in window) ||
      !("AudioEncoder" in window) ||
      !("AudioDecoder" in window)
    ) {
      throw new Error("WebCodecs API not supported in this browser");
    }

    // @remotion/webcodecs is ready immediately
    onProgress?.(100);
    this.isLoaded = true;
  }

  // Main conversion function
  public async convertVideo(
    inputFile: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void,
  ): Promise<Uint8Array> {
    if (!this.isLoaded) {
      throw new Error("WebCodecs not initialized. Call initialize() first.");
    }

    const {
      maxFileSizeMB = 300,
      targetFps = 30,
      maxWidth = 1920,
      audioBitrate = "128k",
      audioSampleRate = 48000,
      crf = 23,
    } = options;

    const duration = options.duration ?? 0;
    if (!duration) {
      throw new Error(
        "Video duration must be supplied in options.duration for size calculations.",
      );
    }

    // Calculate target bitrates (using your existing logic)
    const targetSizeMB = maxFileSizeMB * 0.95;
    const audioBitrateKbps =
      parseInt(audioBitrate.replace(/[^0-9]/g, ""), 10) || 128;
    const videoBitrateKbps = this.calculateTargetBitrate(
      duration,
      targetSizeMB,
      audioBitrateKbps,
    );

    try {
      console.log(
        `🚀 Converting with WebCodecs - Target bitrate: ${videoBitrateKbps}kbps`,
      );

      // Check if the tracks can be re-encoded
      const videoReencodeSupport = await canReencodeVideoTrack({
        container: "mp4",
        videoCodec: "h264",
      });

      const audioReencodeSupport = await canReencodeAudioTrack({
        audioCodec: "aac",
        container: "mp4",
      });

      if (!videoReencodeSupport.supported) {
        throw new Error(
          `Video re-encoding not supported: ${videoReencodeSupport.reason}`,
        );
      }

      if (!audioReencodeSupport.supported) {
        throw new Error(
          `Audio re-encoding not supported: ${audioReencodeSupport.reason}`,
        );
      }

      // Convert using @remotion/webcodecs
      const result = await convertMedia({
        src: inputFile,
        to: "mp4",

        // Video transformation
        onVideoTrack: ({ track }) => {
          console.log("📹 Video track info:", {
            codedHeight: track.codedHeight,
            codedWidth: track.codedWidth,
            displayAspectHeight: track.displayAspectHeight,
            displayAspectWidth: track.displayAspectWidth,
            rotation: track.rotation,
            trackId: track.trackId,
          });

          // Get dimensions with proper fallbacks
          const originalWidth =
            track.displayAspectWidth ?? track.codedWidth ?? 1920;
          const originalHeight =
            track.displayAspectHeight ?? track.codedHeight ?? 1080;

          if (!originalWidth || !originalHeight) {
            console.warn(
              "⚠️ Could not determine video dimensions, using defaults",
            );
            return {
              codec: "h264",
              bitrate: videoBitrateKbps * 1000,
              width: Math.min(1920, maxWidth),
              height: 1080,
              fps: targetFps,
            };
          }

          // Calculate scaled dimensions
          const { width, height } = this.calculateScaledDimensions(
            originalWidth,
            originalHeight,
            maxWidth,
          );

          console.log(
            `📐 Scaling ${originalWidth}x${originalHeight} → ${width}x${height}`,
          );

          // // Map CRF to quality-based settings
          // ...(crf <= 18
          //   ? {
          //       codec: "avc1.640028", // High profile
          //       bitrateMode: "variable" as const,
          //     }
          //   : crf <= 23
          //     ? {
          //         codec: "avc1.42E01E", // Baseline profile
          //         bitrateMode: "variable" as const,
          //       }
          //     : {
          //         codec: "avc1.42001E", // Baseline profile, lower quality
          //         bitrateMode: "constant" as const,
          //       }),

          return {
            // Convert to bits per second
            bitrate: videoBitrateKbps * 1000,
            codec: "h264",
            // H.264 specific settings (approximating your FFmpeg settings)
            encoderConfig: {
              bitrateMode: "variable",
              // Baseline profile
              codec: "avc1.42E01E",
            },
            fps: targetFps,
            height,
            width,
          };
        },

        // Audio transformation
        onAudioTrack: ({ track }) => {
          console.log("🎵 Audio track info:", {
            numberOfChannels: track.numberOfChannels,
            sampleRate: track.sampleRate,
            trackId: track.trackId,
          });

          return {
            bitrate: audioBitrateKbps * 1000,
            codec: "aac",
            numberOfChannels: Math.min(track.numberOfChannels ?? 2, 2), // Stereo max
            sampleRate: audioSampleRate,
          };
        },

        // Progress tracking
        onProgress: ({ progress }) => {
          // @remotion/webcodecs gives progress as 0-1, convert to 0-100
          const percentage = Math.round(progress * 100);
          onProgress?.(percentage);
        },

        // Container settings (equivalent to your FFmpeg flags)
        container: "mp4",

        // This approximates -movflags +faststart
        // @remotion/webcodecs handles this automatically for web-optimized MP4s
      });

      const outputBuffer = await result.arrayBuffer();
      const sizeMB = outputBuffer.byteLength / (1024 * 1024);

      console.log(
        `✅ Conversion complete! Final size: ${sizeMB.toFixed(2)}MB (limit ${maxFileSizeMB}MB)`,
      );

      // Check if we exceeded the size limit
      if (sizeMB > maxFileSizeMB) {
        console.warn(
          `⚠️ Output size (${sizeMB.toFixed(2)}MB) exceeds limit (${maxFileSizeMB}MB)`,
        );
        // You could implement a retry with lower bitrate here if needed
      }

      return new Uint8Array(outputBuffer);
    } catch (error) {
      // Provide helpful error messages
      if (error.message?.includes("not supported")) {
        throw new Error(
          `WebCodecs conversion failed: ${error.message}. ` +
            "Your browser or video format may not be supported. Consider using FFmpeg WASM as fallback.",
        );
      }

      throw new Error(`Video conversion failed: ${error.message}`);
    }
  }

  // Utility function to download the converted file
  public downloadFile(
    data: Uint8Array,
    filename = "converted_video.mp4",
  ): void {
    const blob = new Blob([data], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Calculate scaled dimensions maintaining aspect ratio
  private calculateScaledDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
  ): { width: number; height: number } {
    if (originalWidth <= maxWidth) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalHeight / originalWidth;
    const scaledHeight = Math.round(maxWidth * aspectRatio);

    return {
      width: maxWidth,
      height: scaledHeight % 2 === 0 ? scaledHeight : scaledHeight - 1, // Ensure even height for YUV420
    };
  }

  // Your existing bitrate calculation (unchanged)
  private calculateTargetBitrate(
    durationSeconds: number,
    maxFileSizeMB: number,
    audioBitrateKbps = 128,
  ): number {
    const maxFileSizeBits = maxFileSizeMB * 8 * 1024 * 1024;
    const audioBits = audioBitrateKbps * 1000 * durationSeconds;
    const videoBits = maxFileSizeBits - audioBits;
    const videoBitrateKbps = Math.floor(videoBits / durationSeconds / 1000);

    return Math.max(500, Math.min(videoBitrateKbps, 25000));
  }
}

export { VideoConverter };
