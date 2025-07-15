/* eslint-disable no-useless-catch */
// First install dependencies:
// npm install mp4-muxer @remotion/media-parser

import { parseMedia } from "@remotion/media-parser";
import { ArrayBufferTarget, Muxer } from "mp4-muxer";

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
    // WebCodecs is built into the browser, no initialization needed
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

    // WebCodecs is ready immediately
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

    // Calculate target bitrates
    const targetSizeMB = maxFileSizeMB * 0.95;
    const audioBitrateKbps =
      parseInt(audioBitrate.replace(/[^0-9]/g, ""), 10) || 128;
    const videoBitrateKbps = this.calculateTargetBitrate(
      duration,
      targetSizeMB,
      audioBitrateKbps,
    );

    let processedFrames = 0;
    let totalFrames = Math.ceil(duration * targetFps);

    try {
      // Parse input media
      const arrayBuffer = await inputFile.arrayBuffer();
      const parseResult = await parseMedia({
        src: new Uint8Array(arrayBuffer),
        fields: {
          tracks: true,
          durationInSeconds: true,
          dimensions: true,
        },
      });

      if (!parseResult.tracks) {
        throw new Error("No tracks found in input video");
      }

      const videoTrack = parseResult.tracks.find((t) => t.type === "video");
      const audioTrack = parseResult.tracks.find((t) => t.type === "audio");

      if (!videoTrack) {
        throw new Error("No video track found in input");
      }

      // Update total frames based on actual video
      if (parseResult.durationInSeconds) {
        totalFrames = Math.ceil(parseResult.durationInSeconds * targetFps);
      }

      // Set up MP4 muxer
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: "avc",
          width: Math.min(videoTrack.dimensions?.width || 1920, maxWidth),
          height: this.calculateScaledHeight(
            videoTrack.dimensions?.width || 1920,
            videoTrack.dimensions?.height || 1080,
            maxWidth,
          ),
        },
        audio: audioTrack
          ? {
              codec: "aac",
              sampleRate: audioSampleRate,
              numberOfChannels: 2,
            }
          : undefined,
        fastStart: "in-memory", // Equivalent to -movflags +faststart
      });

      // Set up video encoder
      const videoEncoder = new VideoEncoder({
        output: (chunk, metadata) => {
          muxer.addVideoChunk(chunk, metadata);
          processedFrames++;

          const progress = Math.min(95, (processedFrames / totalFrames) * 100);
          onProgress?.(Math.round(progress));
        },
        error: (error) => {
          throw new Error(`Video encoding error: ${error.message}`);
        },
      });

      // Configure video encoder (approximating your FFmpeg settings)
      const videoConfig: VideoEncoderConfig = {
        codec: this.getH264CodecString(crf), // H.264 with profile/level
        width: Math.min(videoTrack.dimensions?.width || 1920, maxWidth),
        height: this.calculateScaledHeight(
          videoTrack.dimensions?.width || 1920,
          videoTrack.dimensions?.height || 1080,
          maxWidth,
        ),
        bitrate: videoBitrateKbps * 1000, // Convert to bits per second
        framerate: targetFps,
        bitrateMode: "variable", // Similar to your CRF + maxrate approach
      };

      const isVideoConfigSupported =
        await VideoEncoder.isConfigSupported(videoConfig);
      if (!isVideoConfigSupported.supported) {
        throw new Error(
          `Video encoder configuration not supported: ${isVideoConfigSupported.error}`,
        );
      }

      videoEncoder.configure(videoConfig);

      // Set up audio encoder (if audio track exists)
      let audioEncoder: AudioEncoder | undefined;
      if (audioTrack) {
        audioEncoder = new AudioEncoder({
          output: (chunk, metadata) => {
            muxer.addAudioChunk(chunk, metadata);
          },
          error: (error) => {
            throw new Error(`Audio encoding error: ${error.message}`);
          },
        });

        const audioConfig: AudioEncoderConfig = {
          codec: "mp4a.40.2", // AAC-LC
          sampleRate: audioSampleRate,
          numberOfChannels: 2,
          bitrate: audioBitrateKbps * 1000,
        };

        const isAudioConfigSupported =
          await AudioEncoder.isConfigSupported(audioConfig);
        if (!isAudioConfigSupported.supported) {
          throw new Error(
            `Audio encoder configuration not supported: ${isAudioConfigSupported.error}`,
          );
        }

        audioEncoder.configure(audioConfig);
      }

      // Decode and re-encode video
      await this.processVideoTrack(
        arrayBuffer,
        videoTrack,
        videoEncoder,
        videoConfig,
        targetFps,
      );

      // Decode and re-encode audio (if exists)
      if (audioTrack && audioEncoder) {
        await this.processAudioTrack(arrayBuffer, audioTrack, audioEncoder);
      }

      // Flush encoders
      await videoEncoder.flush();
      if (audioEncoder) {
        await audioEncoder.flush();
      }

      // Finalize muxer
      muxer.finalize();

      const outputBuffer = muxer.target.buffer;
      const sizeMB = outputBuffer.byteLength / (1024 * 1024);

      console.log(
        `Final size: ${sizeMB.toFixed(2)}MB (limit ${maxFileSizeMB}MB)`,
      );

      onProgress?.(100);

      return new Uint8Array(outputBuffer);
    } catch (error) {
      throw error;
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

  // Process video track: decode frames, scale if needed, and re-encode
  private async processVideoTrack(
    arrayBuffer: ArrayBuffer,
    videoTrack: any,
    encoder: VideoEncoder,
    config: VideoEncoderConfig,
    targetFps: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let frameCount = 0;
      const startTime = 0;
      const frameDuration = 1000000 / targetFps; // microseconds per frame

      const decoder = new VideoDecoder({
        output: async (frame) => {
          try {
            // Scale frame if needed
            const scaledFrame = await this.scaleVideoFrame(
              frame,
              config.width,
              config.height,
            );

            // Set consistent timestamp for target fps
            const timestamp = startTime + frameCount * frameDuration;
            const newFrame = new VideoFrame(scaledFrame, { timestamp });

            // Encode frame
            const keyFrame = frameCount % (targetFps * 2) === 0; // Keyframe every 2 seconds
            encoder.encode(newFrame, { keyFrame });

            frameCount++;

            // Clean up frames
            frame.close();
            scaledFrame.close();
            newFrame.close();
          } catch (error) {
            reject(error);
          }
        },
        error: reject,
      });

      // Configure decoder (this would need the actual codec config from the track)
      decoder.configure({
        codec: videoTrack.codecWithoutConfig, // You'd get this from media parser
        description: videoTrack.description, // Codec-specific data
      });

      // Parse and feed chunks to decoder (simplified - you'd use media-parser samples)
      // This is a simplified example - real implementation would parse samples properly
      const chunk = new EncodedVideoChunk({
        type: "key",
        timestamp: 0,
        data: new Uint8Array(arrayBuffer), // This would be actual video samples
      });

      decoder.decode(chunk);
      decoder.flush().then(resolve).catch(reject);
    });
  }

  // Process audio track
  private async processAudioTrack(
    arrayBuffer: ArrayBuffer,
    audioTrack: any,
    encoder: AudioEncoder,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const decoder = new AudioDecoder({
        output: (audioData) => {
          // Re-encode audio with target settings
          encoder.encode(audioData);
          audioData.close();
        },
        error: reject,
      });

      decoder.configure({
        codec: audioTrack.codecWithoutConfig,
        description: audioTrack.description,
      });

      // Simplified - real implementation would parse audio samples
      const chunk = new EncodedAudioChunk({
        type: "key",
        timestamp: 0,
        data: new Uint8Array(arrayBuffer),
      });

      decoder.decode(chunk);
      decoder.flush().then(resolve).catch(reject);
    });
  }

  // Scale video frame using Canvas (equivalent to FFmpeg scale filter)
  private async scaleVideoFrame(
    frame: VideoFrame,
    targetWidth: number,
    targetHeight: number,
  ): Promise<VideoFrame> {
    if (
      frame.displayWidth === targetWidth &&
      frame.displayHeight === targetHeight
    ) {
      return frame; // No scaling needed
    }

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d")!;

    // Draw and scale frame
    ctx.drawImage(frame, 0, 0, targetWidth, targetHeight);

    // Create new VideoFrame from scaled canvas
    return new VideoFrame(canvas, {
      timestamp: frame.timestamp,
    });
  }

  // Calculate scaled height maintaining aspect ratio
  private calculateScaledHeight(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
  ): number {
    if (originalWidth <= maxWidth) {
      return originalHeight;
    }

    const aspectRatio = originalHeight / originalWidth;
    const scaledHeight = Math.round(maxWidth * aspectRatio);

    // Ensure even height for YUV420
    return scaledHeight % 2 === 0 ? scaledHeight : scaledHeight - 1;
  }

  // Generate H.264 codec string (approximating your profile/level settings)
  private getH264CodecString(crf: number): string {
    // Map CRF to different profiles (simplified)
    if (crf <= 18) {
      return "avc1.640028"; // High profile, level 4.0
    } else if (crf <= 23) {
      return "avc1.42E01E"; // Baseline profile, level 3.0
    }
    return "avc1.42001E"; // Baseline profile, level 3.0, lower quality
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
