import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
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

export class FFmpegAudioPreprocessor {
  private readonly ffmpeg: FFmpeg;
  private initialized = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log("Initializing FFmpeg...");

    // Load FFmpeg wasm files
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    this.initialized = true;
    console.log("FFmpeg initialized");
  }

  // Convert 32-bit audio to 16-bit PCM stereo using FFmpeg
  async convertAudioTo16BitPCM(file: File): Promise<File> {
    if (!this.initialized) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    try {
      console.log("Converting audio to 16-bit PCM using FFmpeg...");

      // Write input file to FFmpeg filesystem
      const inputFileName = `input.${file.name.split(".").pop()}`;
      const outputFileName = "output_audio.wav";

      await this.ffmpeg.writeFile(
        inputFileName,
        new Uint8Array(await file.arrayBuffer()),
      );

      // FFmpeg command to extract and convert audio:
      // -i input: input file
      // -vn: no video (audio only)
      // -acodec pcm_s16le: 16-bit PCM little endian
      // -ac 2: stereo (2 channels)
      // -ar 44100: 44.1kHz sample rate (you can change this)
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        "-vn", // No video
        "-acodec",
        "pcm_s16le", // 16-bit PCM
        "-ac",
        "2", // Stereo
        "-ar",
        // "44100", // 44.1kHz sample rate
        "48000", // 48kHz sample rate
        outputFileName,
      ]);

      // Read the output file
      const audioData = await this.ffmpeg.readFile(outputFileName);

      // Clean up
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      // Create audio file
      const audioBlob = new Blob([audioData], { type: "audio/wav" });
      const audioFile = new File([audioBlob], "converted_audio.wav", {
        type: "audio/wav",
      });

      console.log(
        `Audio converted to 16-bit PCM: ${(audioBlob.size / 1024).toFixed(2)}KB`,
      );
      return audioFile;
    } catch (error) {
      console.error("FFmpeg audio conversion error:", error);
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }

  // Extract video without audio (for separate processing)
  async extractVideoOnly(file: File): Promise<File> {
    if (!this.initialized) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    try {
      console.log("Extracting video track (no audio)...");

      const inputFileName = `input.${file.name.split(".").pop()}`;
      const outputFileName = "video_only.mp4";

      await this.ffmpeg.writeFile(
        inputFileName,
        new Uint8Array(await file.arrayBuffer()),
      );

      // Extract video only
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        "-an", // No audio
        "-vcodec",
        "copy", // Copy video without re-encoding
        outputFileName,
      ]);

      const videoData = await this.ffmpeg.readFile(outputFileName);

      // Clean up
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      const videoBlob = new Blob([videoData], { type: "video/mp4" });
      const videoFile = new File([videoBlob], "video_only.mp4", {
        type: "video/mp4",
      });

      console.log(
        `Video extracted: ${(videoBlob.size / (1024 * 1024)).toFixed(2)}MB`,
      );
      return videoFile;
    } catch (error) {
      console.error("FFmpeg video extraction error:", error);
      throw new Error(`Video extraction failed: ${error.message}`);
    }
  }

  // Combine processed audio with video using FFmpeg (alternative to webcodecs)
  async combineAudioVideo(videoFile: File, audioFile: File): Promise<File> {
    if (!this.initialized) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    try {
      console.log("Combining audio and video with FFmpeg...");

      const videoFileName = "video.mp4";
      const audioFileName = "audio.wav";
      const outputFileName = "combined.mp4";

      await this.ffmpeg.writeFile(
        videoFileName,
        new Uint8Array(await videoFile.arrayBuffer()),
      );
      await this.ffmpeg.writeFile(
        audioFileName,
        new Uint8Array(await audioFile.arrayBuffer()),
      );

      // Combine audio and video
      await this.ffmpeg.exec([
        "-i",
        videoFileName, // Video input
        "-i",
        audioFileName, // Audio input
        "-c:v",
        "copy", // Copy video without re-encoding
        "-c:a",
        "aac", // Encode audio as AAC
        "-b:a",
        "128k", // Audio bitrate
        "-shortest", // Match shortest stream duration
        outputFileName,
      ]);

      const combinedData = await this.ffmpeg.readFile(outputFileName);

      // Clean up
      await this.ffmpeg.deleteFile(videoFileName);
      await this.ffmpeg.deleteFile(audioFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      const combinedBlob = new Blob([combinedData], { type: "video/mp4" });
      const combinedFile = new File([combinedBlob], "combined_output.mp4", {
        type: "video/mp4",
      });

      console.log(
        `Combined file: ${(combinedBlob.size / (1024 * 1024)).toFixed(2)}MB`,
      );
      return combinedFile;
    } catch (error) {
      console.error("FFmpeg combine error:", error);
      throw new Error(`Combining failed: ${error.message}`);
    }
  }
}

// Updated VideoConverter that uses FFmpeg preprocessing
export class VideoConverter {
  private readonly ffmpegProcessor: FFmpegAudioPreprocessor;
  private initialized = false;

  constructor() {
    this.ffmpegProcessor = new FFmpegAudioPreprocessor();
  }

  async initialize(): Promise<void> {
    // Check WebCodecs support
    if (!("VideoEncoder" in window) || !("VideoDecoder" in window)) {
      throw new Error("WebCodecs is not supported in this browser");
    }

    // Initialize FFmpeg
    await this.ffmpegProcessor.initialize();

    this.initialized = true;
    console.log("VideoConverter with FFmpeg preprocessing initialized");
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
      console.log(
        "Converting with WebCodecs after FFmpeg audio preprocessing...",
      );

      // Step 1: Preprocess audio with FFmpeg
      const processedAudioFile =
        await this.ffmpegProcessor.convertAudioTo16BitPCM(file);

      // Step 2: Create a new video file with the processed audio
      // This requires muxing the audio back with the original video
      const videoWithProcessedAudio =
        await this.ffmpegProcessor.combineAudioVideo(
          await this.ffmpegProcessor.extractVideoOnly(file),
          processedAudioFile,
        );

      // Step 3: Now use WebCodecs on the file with compatible audio
      const metadata = await parseMedia({
        src: videoWithProcessedAudio,
        fields: {
          dimensions: true,
          fps: true,
          durationInSeconds: true,
        },
      });

      const { width: originalWidth, height: originalHeight } =
        metadata.dimensions ?? { width: 1920, height: 1080 };
      const originalFps = metadata.fps ?? 30;

      // Calculate target dimensions
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (originalWidth > options.maxWidth) {
        const aspectRatio = originalHeight / originalWidth;
        targetWidth = options.maxWidth;
        targetHeight = Math.round(options.maxWidth * aspectRatio);
      }

      targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
      targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

      console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);

      const targetSizeMB = options.maxFileSizeMB * 0.95;

      const targetBitrate = this.calculateTargetBitrate(
        options.duration,
        targetSizeMB,
        options.audioBitrate,
      );
      console.log(`Target bitrate: ${targetBitrate} kbps`);

      const result = await convertMedia({
        src: videoWithProcessedAudio,
        container: "mp4",
        videoCodec: "h264",
        audioCodec: "aac",
        // expectedDurationInSeconds: options.duration,
        // expectedFrameRate: Math.min(originalFps, options.targetFps),
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
            `WebCodecs conversion progress: ${Math.round(overallProgress * 100)}%`,
          );
        },
        onVideoTrack: async ({ track, defaultVideoCodec, canCopyTrack }) => {
          // if (
          //   canCopyTrack &&
          //   targetWidth === originalWidth &&
          //   targetHeight === originalHeight &&
          //   originalFps <= options.targetFps
          // ) {
          //   console.log("Copying video track");
          //   return { type: "copy" };
          // }

          console.log("Re-encoding video track");
          return {
            type: "reencode",
            videoCodec: "h264",
            // crf: options.crf,
            // bitrate: targetBitrate,
          };
        },
        onAudioTrack: async ({ track, defaultAudioCodec, canCopyTrack }) => {
          // if (!track) return { type: "drop" };

          // // Audio should now be compatible 16-bit PCM/AAC
          // if (canCopyTrack && defaultAudioCodec === "aac") {
          //   console.log("Copying preprocessed audio track");
          //   return { type: "copy" };
          // }

          console.log("Re-encoding preprocessed audio to AAC");
          return {
            type: "reencode",
            audioCodec: "aac",
            bitrate: options.audioBitrate,
            sampleRate: options.audioSampleRate,
          };
        },
      });

      const blob = await result.save();
      const arrayBuffer = await blob.arrayBuffer();
      await result.remove();

      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error(
        "WebCodecs conversion after FFmpeg preprocessing failed:",
        error,
      );
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

  // Helper method to create a File from Uint8Array for downloading
  createFileFromArray(
    data: Uint8Array,
    filename = "converted_video.mp4",
  ): File {
    const blob = new Blob([data], { type: "video/mp4" });
    return new File([blob], filename, { type: "video/mp4" });
  }

  // Calculate target video bitrate to stay under file size limit
  private calculateTargetBitrate(
    durationSeconds: number,
    maxFileSizeMB: number,
    audioBitrateKbps = 128000,
  ): number {
    const maxFileSizeBits = maxFileSizeMB * 8 * 1024 * 1024;
    const audioBits = audioBitrateKbps * durationSeconds;
    const videoBits = maxFileSizeBits - audioBits;
    const videoBitrateKbps = Math.floor(videoBits / durationSeconds / 1000);

    // Ensure minimum quality and maximum limits
    return Math.max(500, Math.min(videoBitrateKbps, 25000));
  }
}
