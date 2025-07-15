import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface ConversionOptions {
  audioBitrate?: string;
  audioSampleRate?: number;
  duration?: number;
  maxFileSizeMB?: number;
  maxWidth?: number;
  targetFps?: number;
}

class VideoConverter {
  private readonly ffmpeg: FFmpeg;
  private isLoaded = false;

  public constructor() {
    this.ffmpeg = new FFmpeg();
  }

  // Initialize FFmpeg WASM
  public async initialize(
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    if (this.isLoaded) return;

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

    // Load FFmpeg with progress tracking
    this.ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });

    if (onProgress) {
      this.ffmpeg.on("progress", ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    this.isLoaded = true;
  }

  // Main conversion function
  public async convertVideo(
    inputFile: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void,
  ): Promise<Uint8Array> {
    if (!this.isLoaded) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    const {
      maxFileSizeMB = 300,
      targetFps = 30,
      maxWidth = 1920,
      audioBitrate = "128k",
      audioSampleRate = 48000,
    } = options;

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    try {
      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

      // Get video duration (simplified - in real implementation you'd parse ffmpeg output)
      const duration = options.duration ?? 0;

      // Calculate target bitrate
      const targetBitrate = this.calculateTargetBitrate(
        duration,
        maxFileSizeMB,
        128,
      );
      console.log(
        `Target bitrate: ${targetBitrate}kbps for ${duration}s video`,
      );

      // Build FFmpeg command
      const ffmpegArgs = [
        "-i",
        inputFileName,
        "-r",
        targetFps.toString(),
        // H.264 video codec
        // ---------------------------------------------------------------------
        "-c:v",
        "libx264",
        // Variable bitrate with 25Mbps maximum
        // ---------------------------------------------------------------------
        "-crf",
        "23",
        "-maxrate",
        "25M",
        "-bufsize",
        "50M",
        // "-b:v",
        // `${targetBitrate}k`,
        // "-maxrate",
        // `${Math.min(targetBitrate * 2, 25000)}k`,
        // "-bufsize",
        // `${Math.min(targetBitrate * 4, 50000)}k`,
        // Closed GOP structure (assuming 30fps, adjust GOP size based on your framerate)
        // ---------------------------------------------------------------------
        // "-g",
        // "60",
        // "-keyint_min",
        // "60",
        // "-sc_threshold",
        // "0",
        // 4:2:0 chroma subsampling
        // ---------------------------------------------------------------------
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "high",
        "-level",
        "4.0",
        "-vf",
        // Scale to max 1920 width, maintain aspect ratio, ensure even height
        // ---------------------------------------------------------------------
        `scale='min(${maxWidth},iw)':-2`,
        // AAC audio, 128kbps, 48kHz, stereo
        // ---------------------------------------------------------------------
        "-c:a",
        "aac",
        "-b:a",
        audioBitrate,
        "-ar",
        audioSampleRate.toString(),
        "-ac",
        "2",
        // Moves moov atom to front for web streaming
        // ---------------------------------------------------------------------
        "-movflags",
        "+faststart",
        // Helps avoid edit lists
        // ---------------------------------------------------------------------
        "-avoid_negative_ts",
        "make_zero",
        // Overwrite output file
        // ---------------------------------------------------------------------
        "-y",
        outputFileName,
      ];

      console.log("FFmpeg command:", ffmpegArgs.join(" "));

      // Execute conversion
      await this.ffmpeg.exec(ffmpegArgs);

      // Read the output file
      const outputData = await this.ffmpeg.readFile(outputFileName);

      // Clean up
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      return new Uint8Array(outputData as ArrayBuffer);
    } catch (error) {
      console.error("Conversion failed:", error);
      throw new Error(`Video conversion failed: ${error}`);
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

  // Calculate target video bitrate to stay under file size limit
  private calculateTargetBitrate(
    durationSeconds: number,
    maxFileSizeMB: number,
    audioBitrateKbps = 128,
  ): number {
    const maxFileSizeBits = maxFileSizeMB * 8 * 1024 * 1024;
    const audioBits = audioBitrateKbps * 1000 * durationSeconds;
    const videoBits = maxFileSizeBits - audioBits;
    const videoBitrateKbps = Math.floor(videoBits / durationSeconds / 1000);

    // Ensure minimum quality and maximum limits
    return Math.max(500, Math.min(videoBitrateKbps, 25000));
  }
}

export { VideoConverter };
