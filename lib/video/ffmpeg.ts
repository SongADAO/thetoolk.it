import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpegInstance: FFmpeg | null = null;

let videoDuration: number | null = null;

interface ProgressInfo {
  phase: string;
  // 0-100
  progress: number;
  message: string;
  // total duration in seconds (if available)
  duration?: number | null;
  // current time in seconds (if available)
  time?: number | null;
}

function reportProgress(progress: ProgressInfo): void {
  console.log(
    `[${progress.phase}] ${progress.progress}% - ${progress.message}`,
  );
}

async function initializeFFmpeg(
  onProgress: ((progress: number) => void) | undefined | null,
): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  // Load FFmpeg with WebAssembly
  await ffmpeg.load();

  videoDuration = 0;

  // Set up logging and progress tracking
  ffmpeg.on("log", ({ message }) => {
    console.log("FFmpeg:", message);

    // Extract duration from initial probe
    const durationMatch = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/u.exec(
      message,
    );

    if (durationMatch) {
      const hours = parseInt(durationMatch[1], 10);
      const minutes = parseInt(durationMatch[2], 10);
      const seconds = parseFloat(durationMatch[3]);
      videoDuration = hours * 3600 + minutes * 60 + seconds;
      console.log(`Video duration detected: ${videoDuration}s`);
    }
  });

  // Set up progress tracking
  ffmpeg.on("progress", ({ progress, time }) => {
    // FFmpeg progress is 0-1, convert to 0-100
    const progressPercent = Math.round(progress * 100);

    // Convert microseconds to seconds
    const timeSeconds = time / 1000000;

    // Determine which phase we're in based on progress context
    let message = `FFmpeg Conversion Progress: ${progressPercent}%`;

    if (videoDuration) {
      message += ` (${timeSeconds.toFixed(1)}s / ${videoDuration.toFixed(1)}s)`;
    }

    reportProgress({
      duration: videoDuration,
      message,
      phase: "progress",
      progress: progressPercent,
      time: timeSeconds,
    });

    if (onProgress) {
      onProgress(progressPercent);
    }
  });

  // eslint-disable-next-line require-atomic-updates
  ffmpegInstance = ffmpeg;

  reportProgress({
    message: "FFmpeg loaded successfully",
    phase: "initialization",
    progress: 100,
  });

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

export { cleanupFFmpeg, initializeFFmpeg, reportProgress };
