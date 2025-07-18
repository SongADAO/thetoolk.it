import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export interface HLSFiles {
  masterManifest: File;
  streamManifest: File;
  thumbnail: File;
  segments: File[];
}

export class HLSConverter {
  private readonly ffmpeg: FFmpeg;
  private initialized = false;

  public constructor() {
    this.ffmpeg = new FFmpeg();
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load FFmpeg WASM
    await this.ffmpeg.load();

    this.initialized = true;
  }

  public async convertToHLS(videoFile: File): Promise<HLSFiles> {
    if (!this.initialized) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    const inputFileName = "input.mp4";
    const streamPlaylist = "video.m3u8";
    const masterManifest = "manifest.m3u8";
    const thumbnailName = "thumbnail.jpg";

    try {
      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      // Generate HLS segments without re-encoding (if possible)
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
        streamPlaylist,
      ]);

      // Generate thumbnail
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        "-ss",
        "00:00:01",
        "-vframes",
        "1",
        "-q:v",
        "2",
        thumbnailName,
      ]);

      // Read generated files
      const streamManifestData = await this.ffmpeg.readFile(streamPlaylist);
      const thumbnailData = await this.ffmpeg.readFile(thumbnailName);

      // Read all segment files
      const segments: File[] = [];
      let segmentIndex = 0;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const segmentName = `segment_${segmentIndex.toString().padStart(3, "0")}.ts`;
        try {
          // eslint-disable-next-line no-await-in-loop
          const segmentData = await this.ffmpeg.readFile(segmentName);
          segments.push(
            new File([segmentData], segmentName, { type: "video/mp2t" }),
          );
          segmentIndex++;
        } catch (err: unknown) {
          console.error(err);
          // No more segments
          break;
        }
      }

      // 🎯 CREATE MASTER MANIFEST MANUALLY
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

      // Clean up FFmpeg filesystem
      try {
        await this.ffmpeg.deleteFile(inputFileName);
        await this.ffmpeg.deleteFile(streamPlaylist);
        await this.ffmpeg.deleteFile(thumbnailName);
        for (let i = 0; i < segments.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          await this.ffmpeg.deleteFile(
            `segment_${i.toString().padStart(3, "0")}.ts`,
          );
        }
      } catch (error) {
        console.warn("Error cleaning up FFmpeg files:", error);
      }

      // 🎯 RETURN BOTH MANIFESTS
      return {
        masterManifest: masterManifestFile,
        segments,
        streamManifest: streamManifestFile,
        thumbnail,
      };
    } catch (err: unknown) {
      const errMessage =
        err instanceof Error ? err.message : "HLS Upload failed";
      console.error("HLS conversion failed:", err);
      throw new Error(`HLS conversion failed: ${errMessage}`);
    }
  }
}
