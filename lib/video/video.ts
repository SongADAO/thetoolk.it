function formatFileSize(sizeInBytes: number) {
  const kb = sizeInBytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
}

function formatFileDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const padded = (num: number) => num.toString().padStart(2, "0");

  return hours > 0
    ? `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`
    : `${padded(minutes)}:${padded(seconds)}`;
}

async function getVideoDuration(video: File): Promise<number> {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      resolve(videoElement.duration);
    };

    videoElement.onerror = () => {
      window.URL.revokeObjectURL(videoElement.src);
      resolve(0);
    };

    videoElement.src = URL.createObjectURL(video);
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
  formatFileDuration,
  formatFileSize,
  getFileExtension,
  getVideoDuration,
};
