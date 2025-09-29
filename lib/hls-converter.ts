import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface HLSFiles {
  masterManifest: File;
  streamManifest: File;
  thumbnail: File;
  segments: File[];
}

interface ProgressInfo {
  phase:
    | "initialization"
    | "hls_conversion"
    | "thumbnail"
    | "reading_files"
    | "cleanup"
    | "complete";
  // 0-100
  progress: number;
  message: string;
  // total duration in seconds (if available)
  duration?: number;
  // current time in seconds (if available)
  time?: number;
}

type ProgressCallback = (progress: number) => void;

class HLSConverter {
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
      message: "Loading FFmpeg WASM...",
      phase: "initialization",
      progress: 0,
    });

    // Load FFmpeg WASM with explicit memory configuration
    await this.ffmpeg.load();

    // Set up logging and progress tracking
    this.ffmpeg.on("log", ({ message }) => {
      console.log("FFmpeg:", message);

      // Extract duration from initial probe
      const durationMatch = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/u.exec(
        message,
      );
      if (durationMatch) {
        const hours = parseInt(durationMatch[1], 10);
        const minutes = parseInt(durationMatch[2], 10);
        const seconds = parseFloat(durationMatch[3]);
        this.videoDuration = hours * 3600 + minutes * 60 + seconds;
        console.log(`Video duration detected: ${this.videoDuration}s`);
      }
    });

    this.ffmpeg.on("progress", ({ progress, time }) => {
      if (this.progressCallback) {
        // FFmpeg progress is 0-1, convert to 0-100
        const progressPercent = Math.round(progress * 100);
        // Convert microseconds to seconds
        const timeSeconds = time / 1000000;

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
          duration: this.videoDuration,
          message,
          phase,
          progress: progressPercent,
          time: timeSeconds,
        });
      }
    });

    this.reportProgress({
      message: "FFmpeg loaded successfully",
      phase: "initialization",
      progress: 100,
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
      message: "Starting HLS conversion...",
      phase: "hls_conversion",
      progress: 0,
    });

    // Add file size check (adjust based on your needs)
    // 1GB for H.264/AAC
    const maxFileSize = 1024 * 1024 * 1024;
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
        message: "Writing input file to FFmpeg filesystem...",
        phase: "hls_conversion",
        progress: 5,
      });

      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      this.reportProgress({
        message: "Starting HLS segmentation...",
        phase: "hls_conversion",
        progress: 10,
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
        // Include all segments in playlist
        "-hls_list_size",
        "0",
        streamPlaylist,
      ]);

      this.reportProgress({
        message: "Generating thumbnail...",
        phase: "thumbnail",
        progress: 70,
      });

      // Generate thumbnail with safer parameters
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        // Only map the video stream, ignore timecode/data streams
        "-map",
        "0:v:0",
        // Seek to 0.5s instead of 1s (safer)
        "-ss",
        "00:00:00.5",
        "-vframes",
        "1",
        // Slightly lower quality (2 might be too high quality)
        "-q:v",
        "5",
        // Explicit format conversion
        "-vf",
        "scale=320:240:flags=fast_bilinear,format=yuvj420p",
        // Explicit output format
        "-f",
        "mjpeg",
        thumbnailName,
      ]);

      this.reportProgress({
        message: "Reading generated files...",
        phase: "reading_files",
        progress: 80,
      });

      // Read generated files
      const streamManifestData = await this.ffmpeg.readFile(streamPlaylist);
      const thumbnailData = await this.ffmpeg.readFile(thumbnailName);

      // Parse the playlist to get actual segment count (safer than infinite loop)
      const playlistContent = new TextDecoder().decode(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        streamManifestData as Uint8Array,
      );
      const segmentLines = playlistContent
        .split("\n")
        .filter((line) => line.endsWith(".ts"));
      const expectedSegmentCount = segmentLines.length;

      console.log(`Expected ${expectedSegmentCount} segments from playlist`);

      this.reportProgress({
        message: `Reading ${expectedSegmentCount} HLS segments...`,
        phase: "reading_files",
        progress: 85,
      });

      // Read segments based on playlist content (much safer)
      const segments: File[] = [];
      for (let i = 0; i < expectedSegmentCount; i++) {
        const segmentName = `segment_${i.toString().padStart(3, "0")}.ts`;
        try {
          // eslint-disable-next-line no-await-in-loop
          const segmentData = await this.ffmpeg.readFile(segmentName);
          segments.push(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            new File([segmentData], segmentName, { type: "video/mp2t" }),
          );

          // Update progress for segment reading
          const segmentProgress = 85 + (10 * (i + 1)) / expectedSegmentCount;
          this.reportProgress({
            message: `Read segment ${i + 1}/${expectedSegmentCount}`,
            phase: "reading_files",
            progress: Math.round(segmentProgress),
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
        message: "Creating manifest files...",
        phase: "reading_files",
        progress: 95,
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [streamManifestData],
        streamPlaylist,
        {
          type: "application/vnd.apple.mpegurl",
        },
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const thumbnail = new File([thumbnailData], thumbnailName, {
        type: "image/jpeg",
      });

      this.reportProgress({
        message: "Cleaning up temporary files...",
        phase: "cleanup",
        progress: 98,
      });

      // Clean up FFmpeg filesystem
      const filesToCleanup = [
        inputFileName,
        streamPlaylist,
        thumbnailName,
        ...Array.from(
          { length: expectedSegmentCount },
          // eslint-disable-next-line id-length
          (_, i) => `segment_${i.toString().padStart(3, "0")}.ts`,
        ),
      ];
      await this.cleanup(filesToCleanup);

      this.reportProgress({
        message: `HLS conversion complete! Generated ${segments.length} segments.`,
        phase: "complete",
        progress: 100,
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

      throw new Error(`HLS conversion failed: ${errorMessage}`, { cause: err });
    }
  }

  private reportProgress(progress: ProgressInfo): void {
    console.log(
      `[${progress.phase}] ${progress.progress}% - ${progress.message}`,
    );
    if (this.progressCallback) {
      this.progressCallback(progress.progress);
    }
  }

  private async cleanup(filenames: string[]): Promise<void> {
    for (const filename of filenames) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.ffmpeg.deleteFile(filename);
      } catch (err: unknown) {
        // Ignore cleanup errors for individual files
        console.warn(`Failed to cleanup file ${filename}:`, err);
      }
    }
  }
}

export {
  HLSConverter,
  type HLSFiles,
  type ProgressCallback,
  type ProgressInfo,
};
