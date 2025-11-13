import { FFmpeg } from "@ffmpeg/ffmpeg";

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

export { cleanupFFmpeg, initializeFFmpeg };
