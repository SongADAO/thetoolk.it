import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

import { getVideoDuration } from "@/lib/video";

let ffmpegInstance: FFmpeg | null = null;

async function initializeFFmpeg(
  onProgress: ((progress: number) => void) | undefined | null,
): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  // Load FFmpeg with WebAssembly
  await ffmpeg.load();

  // Set up progress tracking
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      console.log(`FFmpeg progress: ${Math.round(progress * 100)}%`);
      // FFmpeg progress is between 0 and 1, convert to percentage
      const progressPercent = Math.round(progress * 100);
      onProgress(progressPercent);
    });
  }

  // eslint-disable-next-line require-atomic-updates
  ffmpegInstance = ffmpeg;

  return ffmpeg;
}

// Utility function to clean up FFmpeg instance if needed
function cleanupFFmpeg(): void {
  if (ffmpegInstance) {
    // FFmpeg doesn't have an explicit cleanup method in the current API
    // The instance will be garbage collected
    ffmpegInstance = null;
  }
}

// -----------------------------------------------------------------------------

function getFileExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();

  return extension ?? "mp4";
}

// -----------------------------------------------------------------------------

interface TrimVideoOptions {
  label: string;
  maxDuration: number;
  maxFilesize: number;
  minDuration: number;
  onProgress: ((progress: number) => void) | undefined | null;
  video: File;
}

async function trimVideo({
  label,
  maxDuration,
  maxFilesize,
  minDuration,
  onProgress,
  video,
}: TrimVideoOptions): Promise<File | null> {
  try {
    console.log(
      `Trimming video: maxDuration=${maxDuration}s, maxFilesize=${maxFilesize} bytes, minDuration=${minDuration}s`,
    );

    // Get actual video duration
    const actualDuration = await getVideoDuration(video);
    console.log(`Video actual duration: ${actualDuration}s`);

    // If video is shorter than minimum duration, return as-is
    if (actualDuration < minDuration) {
      throw new Error("Video is shorter than minimum duration!");
    }

    // Check if video needs trimming
    if (actualDuration <= maxDuration && video.size <= maxFilesize) {
      console.log("Video is within limits, no trimming needed");
      return null;
    }

    // Initialize FFmpeg
    console.log("Initializing FFmpeg...");
    const ffmpeg = await initializeFFmpeg(onProgress);

    const inputFileName = `input_${Date.now()}.${getFileExtension(video.name)}`;
    const outputFileName = `output_${Date.now()}.${getFileExtension(video.name)}`;

    // Write input file to FFmpeg filesystem
    console.log("Writing input file to FFmpeg filesystem...");
    await ffmpeg.writeFile(inputFileName, await fetchFile(video));

    // Calculate trim duration (use the smaller of maxDuration or actual duration)
    const trimDuration = Math.min(maxDuration, actualDuration);
    console.log(`Trimming to ${trimDuration}s`);

    // Trim video using stream copy (no re-encoding)
    console.log("Executing FFmpeg trim command...");
    await ffmpeg.exec([
      "-i",
      inputFileName,
      // Duration to trim to
      "-t",
      trimDuration.toString(),
      // Copy streams without re-encoding
      "-c",
      "copy",
      // Handle timestamp issues
      "-avoid_negative_ts",
      "make_zero",
      // Generate presentation timestamps
      "-fflags",
      "+genpts",
      // Overwrite output file
      "-y",
      outputFileName,
    ]);

    // Read the output file
    console.log("Reading trimmed video...");
    const outputData = await ffmpeg.readFile(outputFileName);

    // Clean up FFmpeg filesystem
    try {
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary files:", cleanupError);
    }

    // Convert output to File object
    const trimmedBlob = new Blob([outputData as BlobPart], {
      type: video.type,
    });
    const trimmedFile = new File(
      [trimmedBlob],
      `${label}_trimmed_${video.name}`,
      {
        type: video.type,
      },
    );

    console.log(
      `Trim complete! Original: ${(video.size / 1024 / 1024).toFixed(2)}MB (${actualDuration.toFixed(1)}s) -> ` +
        `Trimmed: ${(trimmedFile.size / 1024 / 1024).toFixed(2)}MB (${trimDuration.toFixed(1)}s)`,
    );

    // Check if trimmed file still exceeds filesize limit
    if (trimmedFile.size > maxFilesize) {
      console.warn(
        `Trimmed video (${(trimmedFile.size / 1024 / 1024).toFixed(2)}MB) still exceeds ` +
          `filesize limit (${(maxFilesize / 1024 / 1024).toFixed(2)}MB). Consider additional processing.`,
      );
    }

    return trimmedFile;
  } catch (err: unknown) {
    console.error("Video trimming failed:", err);

    // If trimming fails, return original video if it meets minimum requirements
    if (video.size <= maxFilesize) {
      console.log(
        "Trimming failed but original video meets filesize requirements, returning original",
      );
      return video;
    }

    throw new Error(
      `Video trimming failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      { cause: err },
    );
  }
}

// -----------------------------------------------------------------------------

export { cleanupFFmpeg, trimVideo };
