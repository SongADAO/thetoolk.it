function formatFileSize(sizeInBytes: number) {
  const kb = sizeInBytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
}

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

async function getVideoDuration(video: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      window.URL.revokeObjectURL(videoElement.src);
      videoElement.onloadedmetadata = null;
      videoElement.onerror = null;
    };

    // timeoutId = setTimeout(() => {
    //   cleanup();
    //   reject(
    //     new Error(`Timeout: Could not load video metadata after 10 seconds`),
    //   );
    // }, 10000);

    // On timeout, resolve with a really large duration so it will just trim regardless.
    timeoutId = setTimeout(() => {
      cleanup();
      resolve(43201);
    }, 10000);

    videoElement.onloadedmetadata = () => {
      cleanup();
      resolve(videoElement.duration);
    };

    videoElement.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video metadata"));
    };

    videoElement.src = URL.createObjectURL(video);

    // Handle race condition where metadata may already be loaded
    if (videoElement.readyState >= 1) {
      cleanup();
      resolve(videoElement.duration);
    }
  });
}

function getFileExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();

  return extension ?? "mp4";
}

function downloadFile(file: File): void {
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

// Calculate target video bitrate to stay under file size limit
function calculateTargetBitrate(
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

export {
  calculateTargetBitrate,
  downloadFile,
  formatDuration,
  formatFileSize,
  getFileExtension,
  getVideoDuration,
};
