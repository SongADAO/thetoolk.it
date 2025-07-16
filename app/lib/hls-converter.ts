import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export interface HLSFiles {
  manifest: File;
  thumbnail: File;
  segments: File[];
}

export interface HLSUploadResult {
  folderHash: string;
  playlistUrl: string;
  thumbnailUrl: string;
}

export class HLSConverter {
  private readonly ffmpeg: FFmpeg;
  private initialized = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load FFmpeg WASM
    await this.ffmpeg.load();

    this.initialized = true;
  }

  async convertToHLS(videoFile: File): Promise<HLSFiles> {
    if (!this.initialized) {
      throw new Error("FFmpeg not initialized. Call initialize() first.");
    }

    const inputFileName = "input.mp4";
    const outputPlaylist = "video.m3u8";
    const thumbnailName = "thumbnail.jpg";

    try {
      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      // Generate HLS segments without re-encoding (if possible)
      await this.ffmpeg.exec([
        "-i",
        inputFileName,
        "-c",
        "copy", // Copy streams without re-encoding
        "-f",
        "hls",
        "-hls_time",
        "6",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_filename",
        "segment_%03d.ts",
        outputPlaylist,
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
      const manifestData = await this.ffmpeg.readFile(outputPlaylist);
      const thumbnailData = await this.ffmpeg.readFile(thumbnailName);

      // Read all segment files
      const segments: File[] = [];
      let segmentIndex = 0;

      while (true) {
        const segmentName = `segment_${segmentIndex.toString().padStart(3, "0")}.ts`;
        try {
          const segmentData = await this.ffmpeg.readFile(segmentName);
          segments.push(
            new File([segmentData], segmentName, { type: "video/mp2t" }),
          );
          segmentIndex++;
        } catch (error) {
          // No more segments
          break;
        }
      }

      // Create File objects
      const manifest = new File([manifestData], outputPlaylist, {
        type: "application/vnd.apple.mpegurl",
      });
      const thumbnail = new File([thumbnailData], thumbnailName, {
        type: "image/jpeg",
      });

      // Clean up FFmpeg filesystem
      try {
        await this.ffmpeg.deleteFile(inputFileName);
        await this.ffmpeg.deleteFile(outputPlaylist);
        await this.ffmpeg.deleteFile(thumbnailName);
        for (let i = 0; i < segments.length; i++) {
          await this.ffmpeg.deleteFile(
            `segment_${i.toString().padStart(3, "0")}.ts`,
          );
        }
      } catch (error) {
        console.warn("Error cleaning up FFmpeg files:", error);
      }

      return {
        manifest,
        thumbnail,
        segments,
      };
    } catch (error) {
      console.error("HLS conversion failed:", error);
      throw new Error(`HLS conversion failed: ${error}`);
    }
  }
}
