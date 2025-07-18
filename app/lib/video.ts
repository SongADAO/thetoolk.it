import mediaInfoFactory from "mediainfo.js";

// async function getVideoCodecInfo(file: File): Promise<string> {
//   const MediaInfo = await mediaInfoFactory();

//   const result = await MediaInfo.analyzeData(
//     () => file.size,
//     async (chunkSize, offset) =>
//       new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         const slice = file.slice(offset, offset + chunkSize);

//         reader.onload = (e) => {
//           const readerResult = e.target?.result;

//           // Type guard to ensure we have an ArrayBuffer
//           if (!readerResult || typeof readerResult === "string") {
//             reject(new Error("Failed to read file as ArrayBuffer"));
//             return;
//           }

//           resolve(new Uint8Array(readerResult));
//         };

//         reader.onerror = () => {
//           reject(new Error("FileReader error"));
//         };

//         reader.readAsArrayBuffer(slice);
//       }),
//   );

//   return (
//     result.media?.track
//       .map((track) => {
//         console.log(track);
//         if (track["@type"] === "Video") {
//           return `Video: ${track.Format}${track.CodecID ? ` (${track.CodecID})` : ""}`;
//         }
//         if (track["@type"] === "Audio") {
//           return `Audio: ${track.Format}${track.CodecID ? ` (${track.CodecID})` : ""}`;
//         }
//         return null;
//       })
//       .filter(Boolean)
//       .join(" | ") ?? "Unknown codec"
//   );
// }

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

function getVideoDuration({
  video,
  setVideoDuration,
}: Readonly<{
  video: File;
  setVideoDuration: (duration: number) => void;
}>) {
  const videoElement = document.createElement("video");
  videoElement.preload = "metadata";

  videoElement.onloadedmetadata = () => {
    window.URL.revokeObjectURL(videoElement.src);
    setVideoDuration(videoElement.duration);
  };

  videoElement.src = URL.createObjectURL(video);
}

export {
  formatFileDuration,
  formatFileSize,
  // getVideoCodecInfo,
  getVideoDuration,
};
