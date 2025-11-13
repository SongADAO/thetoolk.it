import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

import {
  cleanupFFmpeg,
  initializeFFmpeg,
  reportProgress,
} from "@/lib/video/ffmpeg";

async function cleanup(ffmpeg: FFmpeg, filenames: string[]): Promise<void> {
  for (const filename of filenames) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await ffmpeg.deleteFile(filename);
    } catch (err: unknown) {
      // Ignore cleanup errors for individual files
      console.warn(`Failed to cleanup file ${filename}:`, err);
    }
  }
}

interface HLSFiles {
  masterManifest: File;
  streamManifest: File;
  thumbnail: File;
  segments: File[];
}

async function convertToHLS(
  videoFile: File,
  onProgress?: (progress: number) => void,
): Promise<HLSFiles> {
  // Initialize FFmpeg
  console.log("Initializing FFmpeg...");
  const ffmpeg = await initializeFFmpeg(onProgress);

  reportProgress({
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
    reportProgress({
      message: "Writing input file to FFmpeg filesystem...",
      phase: "hls_conversion",
      progress: 5,
    });

    // Write input file to FFmpeg filesystem
    await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

    reportProgress({
      message: "Starting HLS segmentation...",
      phase: "hls_conversion",
      progress: 10,
    });

    // Generate HLS segments (H.264/AAC should work with copy)
    await ffmpeg.exec([
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

    reportProgress({
      message: "Generating thumbnail...",
      phase: "thumbnail",
      progress: 70,
    });

    // Generate thumbnail with safer parameters
    await ffmpeg.exec([
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

    reportProgress({
      message: "Reading generated files...",
      phase: "reading_files",
      progress: 80,
    });

    // Read generated files
    const streamManifestData = await ffmpeg.readFile(streamPlaylist);
    const thumbnailData = await ffmpeg.readFile(thumbnailName);

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

    reportProgress({
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
        const segmentData = await ffmpeg.readFile(segmentName);
        segments.push(
          new File([segmentData as BlobPart], segmentName, {
            type: "video/mp2t",
          }),
        );

        // Update progress for segment reading
        const segmentProgress = 85 + (10 * (i + 1)) / expectedSegmentCount;
        reportProgress({
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

    reportProgress({
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
      [streamManifestData as BlobPart],
      streamPlaylist,
      {
        type: "application/vnd.apple.mpegurl",
      },
    );
    const thumbnail = new File([thumbnailData as BlobPart], thumbnailName, {
      type: "image/jpeg",
    });

    reportProgress({
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
    await cleanup(ffmpeg, filesToCleanup);

    reportProgress({
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
        errorMessage = "Unsupported video format. Please try MP4, MOV, or AVI.";
      }
    }

    console.error("HLS conversion failed:", err);

    // Attempt cleanup on error
    try {
      await cleanup(ffmpeg, [inputFileName, streamPlaylist, thumbnailName]);
    } catch (cleanupErr) {
      console.warn("Cleanup failed:", cleanupErr);
    }

    throw new Error(`HLS conversion failed: ${errorMessage}`, { cause: err });
  } finally {
    cleanupFFmpeg();
  }
}

export { convertToHLS, type HLSFiles };
