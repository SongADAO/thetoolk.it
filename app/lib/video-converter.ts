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

    // Adaptive CRF search parameters
    const maxCrf = 23; // highest CRF we will allow (lowest quality / smallest size)
    const minCrf = 18; // lowest CRF we’ll try (higher quality / bigger size)

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";
    const firstPassOutput = "firstpass.mp4"; // temp file to satisfy ffmpeg's first pass

    try {
      // Write input file to FFmpeg FS only once
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

      // -- 1️⃣  Get or derive duration ----------------------------------------------------
      const duration =
        options.duration ??
        0; /* You can parse real duration via ffprobe if desired */

      if (!duration) {
        throw new Error(
          "Video duration (in seconds) must be supplied in options.duration for size calculations.",
        );
      }

      // Pre‑calculate target video bitrate (kbps) once, based on max file size
      const targetBitrate = this.calculateTargetBitrate(
        duration,
        maxFileSizeMB,
        parseInt(audioBitrate.replace(/[^0-9]/g, "")) || 128,
      );

      // We'll iterate CRF values from high (23) down toward minCrf until size ≤ limit
      for (let crf = maxCrf; crf >= minCrf; crf--) {
        const passLogFile = "ffmpeg2pass";

        // Optional: emit progress reset for each CRF attempt
        if (onProgress) onProgress(0);

        // ------------------ First pass (analysis only) -------------------------
        const firstPassArgs = [
          "-y",
          "-i",
          inputFileName,
          "-r",
          targetFps.toString(),
          "-c:v",
          "libx264",
          "-b:v",
          `${targetBitrate}k`,
          "-pass",
          "1",
          "-passlogfile",
          passLogFile,
          "-vf",
          `scale='min(${maxWidth},iw)':-2`,
          "-an",
          "-f",
          "mp4",
          firstPassOutput,
        ];

        await this.ffmpeg.exec(firstPassArgs);

        // ------------------ Second pass (actual encode) -----------------------
        const secondPassArgs = [
          "-y",
          "-i",
          inputFileName,
          "-r",
          targetFps.toString(),
          "-c:v",
          "libx264",
          "-b:v",
          `${targetBitrate}k`,
          "-pass",
          "2",
          "-passlogfile",
          passLogFile,
          "-crf",
          crf.toString(),
          "-pix_fmt",
          "yuv420p",
          "-profile:v",
          "high",
          "-level",
          "4.0",
          "-vf",
          `scale='min(${maxWidth},iw)':-2`,
          "-c:a",
          "aac",
          "-b:a",
          audioBitrate,
          "-ar",
          audioSampleRate.toString(),
          "-ac",
          "2",
          "-movflags",
          "+faststart",
          "-avoid_negative_ts",
          "make_zero",
          "-y",
          outputFileName,
        ];

        await this.ffmpeg.exec(secondPassArgs);

        // ------------------ Check size ----------------------------------------
        const outputData = await this.ffmpeg.readFile(outputFileName);
        const sizeMB = (outputData as Uint8Array).length / (1024 * 1024);

        console.log(
          `CRF ${crf} produced ${sizeMB.toFixed(2)} MB (limit ${maxFileSizeMB} MB)`,
        );

        // Clean up pass log files & first‑pass file regardless of success
        const maybeDelete = async (name: string) => {
          try {
            await this.ffmpeg.deleteFile(name);
          } catch (e) {
            /* ignore */
          }
        };
        await maybeDelete(firstPassOutput);
        await maybeDelete(`${passLogFile}-0.log`);
        await maybeDelete(`${passLogFile}-0.log.mbtree`);

        if (sizeMB <= maxFileSizeMB) {
          // Success!
          await this.ffmpeg.deleteFile(inputFileName);
          // Don't delete output; we'll read/return it
          return new Uint8Array(outputData as ArrayBuffer);
        }

        // Too big → delete output and try a lower CRF (higher quality/size)
        await maybeDelete(outputFileName);
      }

      throw new Error(
        `Unable to encode video under ${maxFileSizeMB} MB even at CRF ${minCrf}.`,
      );
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
