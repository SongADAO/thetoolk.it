// requires version 0.3.4 (0.3.5 is bugged)
import mediaInfoFactory from "mediainfo.js";

async function getVideoCodecInfo(file: File): Promise<string> {
  const MediaInfo = await mediaInfoFactory();

  const result = await MediaInfo.analyzeData(
    () => file.size,
    async (chunkSize, offset) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        const slice = file.slice(offset, offset + chunkSize);

        reader.onload = (e) => {
          const readerResult = e.target?.result;

          // Type guard to ensure we have an ArrayBuffer
          if (!readerResult || typeof readerResult === "string") {
            reject(new Error("Failed to read file as ArrayBuffer"));
            return;
          }

          resolve(new Uint8Array(readerResult));
        };

        reader.onerror = () => {
          reject(new Error("FileReader error"));
        };

        reader.readAsArrayBuffer(slice);
      }),
  );

  return (
    result.media?.track
      .map((track) => {
        console.log(track);
        if (track["@type"] === "Video") {
          return `Video: ${track.Format}${track.CodecID ? ` (${track.CodecID})` : ""}`;
        }
        if (track["@type"] === "Audio") {
          return `Audio: ${track.Format}${track.CodecID ? ` (${track.CodecID})` : ""}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(" | ") ?? "Unknown codec"
  );
}

export { getVideoCodecInfo };
