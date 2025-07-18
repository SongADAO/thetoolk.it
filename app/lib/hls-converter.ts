import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export interface HLSFiles {
  masterManifest: File;
  streamManifest: File;
  thumbnail: File;
  segments: File[];
}

export interface ProgressInfo {
  phase:
    | "initialization"
    | "hls_conversion"
    | "thumbnail"
    | "reading_files"
    | "cleanup"
    | "complete";
  progress: number; // 0-100
  message: string;
  duration?: number; // total duration in seconds (if available)
  time?: number; // current time in seconds (if available)
}

export type ProgressCallback = (progress: number) => void;

export class HLSConverter {
  private readonly ffmpeg: FFmpeg;
  private initialized = false;
  private progressCallback?: ProgressCallback;
  private videoDuration?: number;

  public constructor() {
    this.ffmpeg = new FFmpeg();
  }

  public async initialize(progressCallback?: ProgressCallback): Promise<void> {
    if (this.initialized) return;

    this.progressCallback = progressCallback;

    this.reportProgress({
      phase: "initialization",
      progress: 0,
      message: "Loading FFmpeg WASM...",
    });

    // Load FFmpeg WASM with explicit memory configuration
    await this.ffmpeg.load();

    // Set up logging and progress tracking
    this.ffmpeg.on("log", ({ message }) => {
      console.log("FFmpeg:", message);

      // Extract duration from initial probe
      const durationMatch = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/.exec(
        message,
      );
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseFloat(durationMatch[3]);
        this.videoDuration = hours * 3600 + minutes * 60 + seconds;
        console.log(`Video duration detected: ${this.videoDuration}s`);
      }
    });

    this.ffmpeg.on("progress", ({ progress, time }) => {
      if (this.progressCallback) {
        // FFmpeg progress is 0-1, convert to 0-100
        const progressPercent = Math.round(progress * 100);
        const timeSeconds = time / 1000000; // Convert microseconds to seconds

        console.log(
          `FFmpeg progress: ${progressPercent}% (${timeSeconds.toFixed(1)}s)`,
        );

        // Determine which phase we're in based on progress context
        const phase: ProgressInfo["phase"] = "hls_conversion";
        let message = `Converting to HLS: ${progressPercent}%`;

        if (this.videoDuration) {
          message += ` (${timeSeconds.toFixed(1)}s / ${this.videoDuration.toFixed(1)}s)`;
        }

        this.reportProgress({
          phase,
          progress: progressPercent,
          message,
          duration: this.videoDuration,
          time: timeSeconds,
        });
      }
    });

    this.reportProgress({
      phase: "initialization",
      progress: 100,
      message: "FFmpeg loaded successfully",
    });

    this.initialized = true;
  }

  public async convertToHLS(
    videoFile: File,
    progressCallback?: ProgressCallback,
  ): Promise<HLSFiles> {
    if (!this.initialized) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    // Update progress callback if provided
    if (progressCallback) {
      this.progressCallback = progressCallback;
    }

    this.reportProgress({
      phase: "hls_conversion",
      progress: 0,
      message: "Starting HLS conversion...",
    });

    // Add file size check (adjust based on your needs)
    const maxFileSize = 100 * 1024 * 1024; // 100MB for H.264/AAC
    if (videoFile.size > maxFileSize) {
      throw new Error(
        `Video file too large: ${(videoFile.size / 1024 / 1024).toFixed(1)}MB. Maximum: ${maxFileSize / 1024 / 1024}MB`,
      );
    }

    const inputFileName = "input.mp4";
    const streamPlaylist = "video.m3u8";
    const masterManifest = "manifest.m3u8";
    const thumbnailName = "thumbnail.jpg";

    try {
      this.reportProgress({
        phase: "hls_conversion",
        progress: 5,
        message: "Writing input file to FFmpeg filesystem...",
      });

      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      this.reportProgress({
        phase: "hls_conversion",
        progress: 10,
        message: "Starting HLS segmentation...",
      });

      // Generate HLS segments (H.264/AAC should work with copy)
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        "-c",
        "copy",
        "-f",
        "hls",
        "-hls_time",
        "6",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_filename",
        "segment_%03d.ts",
        "-hls_list_size",
        "0", // Include all segments in playlist
        streamPlaylist,
      ]);

      this.reportProgress({
        phase: "thumbnail",
        progress: 70,
        message: "Generating thumbnail...",
      });

      // Generate thumbnail with safer parameters
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        "-map",
        "0:v:0", // Only map the video stream, ignore timecode/data streams
        "-ss",
        "00:00:00.5", // Seek to 0.5s instead of 1s (safer)
        "-vframes",
        "1",
        "-q:v",
        "5", // Slightly lower quality (2 might be too high quality)
        "-vf",
        "scale=320:240:flags=fast_bilinear,format=yuvj420p", // Explicit format conversion
        "-f",
        "mjpeg", // Explicit output format
        thumbnailName,
      ]);

      this.reportProgress({
        phase: "reading_files",
        progress: 80,
        message: "Reading generated files...",
      });

      // Read generated files
      const streamManifestData = await this.ffmpeg.readFile(streamPlaylist);
      const thumbnailData = await this.ffmpeg.readFile(thumbnailName);

      // Parse the playlist to get actual segment count (safer than infinite loop)
      const playlistContent = new TextDecoder().decode(
        streamManifestData as Uint8Array,
      );
      const segmentLines = playlistContent
        .split("\n")
        .filter((line) => line.endsWith(".ts"));
      const expectedSegmentCount = segmentLines.length;

      console.log(`Expected ${expectedSegmentCount} segments from playlist`);

      this.reportProgress({
        phase: "reading_files",
        progress: 85,
        message: `Reading ${expectedSegmentCount} HLS segments...`,
      });

      // Read segments based on playlist content (much safer)
      const segments: File[] = [];
      for (let i = 0; i < expectedSegmentCount; i++) {
        const segmentName = `segment_${i.toString().padStart(3, "0")}.ts`;
        try {
          const segmentData = await this.ffmpeg.readFile(segmentName);
          segments.push(
            new File([segmentData], segmentName, { type: "video/mp2t" }),
          );

          // Update progress for segment reading
          const segmentProgress = 85 + (10 * (i + 1)) / expectedSegmentCount;
          this.reportProgress({
            phase: "reading_files",
            progress: Math.round(segmentProgress),
            message: `Read segment ${i + 1}/${expectedSegmentCount}`,
          });
        } catch (err: unknown) {
          console.error(`Failed to read segment ${segmentName}:`, err);
          // Don't break - try to get remaining segments
        }
      }

      if (segments.length === 0) {
        throw new Error("No HLS segments were generated");
      }

      if (segments.length !== expectedSegmentCount) {
        console.warn(
          `Expected ${expectedSegmentCount} segments, got ${segments.length}`,
        );
      }

      this.reportProgress({
        phase: "reading_files",
        progress: 95,
        message: "Creating manifest files...",
      });

      // Create master manifest for H.264/AAC
      const masterManifestContent = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=4747600,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=1920x1080
${streamPlaylist}
`;

      // Create File objects
      const masterManifestFile = new File(
        [masterManifestContent],
        masterManifest,
        {
          type: "application/vnd.apple.mpegurl",
        },
      );
      const streamManifestFile = new File(
        [streamManifestData],
        streamPlaylist,
        {
          type: "application/vnd.apple.mpegurl",
        },
      );
      const thumbnail = new File([thumbnailData], thumbnailName, {
        type: "image/jpeg",
      });

      this.reportProgress({
        phase: "cleanup",
        progress: 98,
        message: "Cleaning up temporary files...",
      });

      // Clean up FFmpeg filesystem
      const filesToCleanup = [
        inputFileName,
        streamPlaylist,
        thumbnailName,
        ...Array.from(
          { length: expectedSegmentCount },
          (_, i) => `segment_${i.toString().padStart(3, "0")}.ts`,
        ),
      ];
      await this.cleanup(filesToCleanup);

      this.reportProgress({
        phase: "complete",
        progress: 100,
        message: `HLS conversion complete! Generated ${segments.length} segments.`,
      });

      return {
        masterManifest: masterManifestFile,
        segments,
        streamManifest: streamManifestFile,
        thumbnail,
      };
    } catch (err: unknown) {
      // Enhanced error reporting
      let errorMessage = "Unknown error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check for specific FFmpeg errors
        if (err.message.includes("memory access out of bounds")) {
          errorMessage =
            "Video file too large or complex for browser processing. Try a smaller file or different format.";
        } else if (err.message.includes("Invalid data found")) {
          errorMessage =
            "Invalid or corrupted video file. Please try a different file.";
        } else if (err.message.includes("Operation not permitted")) {
          errorMessage =
            "Unsupported video format. Please try MP4, MOV, or AVI.";
        }
      }

      console.error("HLS conversion failed:", err);

      // Attempt cleanup on error
      try {
        await this.cleanup([inputFileName, streamPlaylist, thumbnailName]);
      } catch (cleanupErr) {
        console.warn("Cleanup failed:", cleanupErr);
      }

      throw new Error(`HLS conversion failed: ${errorMessage}`);
    }
  }

  private reportProgress(progress: ProgressInfo): void {
    console.log(
      `[${progress.phase}] ${progress.progress}% - ${progress.message}`,
    );
    if (this.progressCallback) {
      this.progressCallback(progress.progress ?? 0);
    }
  }

  private async cleanup(filenames: string[]): Promise<void> {
    for (const filename of filenames) {
      try {
        await this.ffmpeg.deleteFile(filename);
      } catch (error) {
        // Ignore cleanup errors for individual files
        console.warn(`Failed to cleanup file ${filename}:`, error);
      }
    }
  }
}
