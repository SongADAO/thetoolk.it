import { parseMedia } from "@remotion/media-parser";
import { convertMedia } from "@remotion/webcodecs";

import {
  combineAudioVideo,
  convertAudioTo16BitPCM,
  extractVideoOnly,
} from "@/lib/video/audio";
import { calculateTargetBitrate } from "@/lib/video/video";

interface ConvertVideoRemotionOptions {
  audioBitrate: number;
  audioSampleRate: number;
  crf: number;
  duration: number;
  maxFileSizeMB: number;
  maxWidth: number;
  maxFps: number;
}

async function convertVideoRemotion(
  file: File,
  options: ConvertVideoRemotionOptions,
  onProgress: (progress: number) => void,
  setVideoConversionStatus: (status: string) => void,
): Promise<Uint8Array> {
  // Check WebCodecs support
  if (!("VideoEncoder" in window) || !("VideoDecoder" in window)) {
    throw new Error("WebCodecs is not supported in this browser");
  }

  try {
    console.log(
      "Converting with WebCodecs after FFmpeg audio preprocessing...",
    );

    // Step 1: Preprocess audio with FFmpeg (with progress tracking)
    setVideoConversionStatus("Encoding audio for optimal quality and size...");
    onProgress(0);
    const processedAudioFile = await convertAudioTo16BitPCM(file, onProgress);

    setVideoConversionStatus("Extracting video...");
    onProgress(0);
    const extractVideo = await extractVideoOnly(file, onProgress);

    // Step 2: Create a new video file with the processed audio
    // This requires muxing the audio back with the original video
    setVideoConversionStatus("Recombining audio and video...");
    onProgress(0);
    const videoWithProcessedAudio = await combineAudioVideo(
      extractVideo,
      processedAudioFile,
      onProgress,
    );

    // Reset progress back to 0 after audio conversion
    setVideoConversionStatus("Encoding video for optimal quality and size...");
    onProgress(0);

    // Step 3: Now use WebCodecs on the file with compatible audio
    const metadata = await parseMedia({
      // acknowledgeRemotionLicense: true,
      fields: {
        dimensions: true,
        durationInSeconds: true,
        fps: true,
      },
      src: videoWithProcessedAudio,
    });

    const { width: originalWidth, height: originalHeight } =
      metadata.dimensions ?? { height: 1080, width: 1920 };

    // const originalFps = metadata.fps ?? 30;

    // Calculate target dimensions
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > options.maxWidth) {
      const aspectRatio = originalHeight / originalWidth;
      targetWidth = options.maxWidth;
      targetHeight = Math.round(options.maxWidth * aspectRatio);
    }

    targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
    targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

    console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);

    const targetSizeMB = options.maxFileSizeMB * 0.95;

    const targetBitrate = calculateTargetBitrate(
      options.duration,
      targetSizeMB,
      options.audioBitrate,
    );
    console.log(`Target bitrate: ${targetBitrate} kbps`);

    // Calculate scale factor instead of explicit dimensions
    const resizeOperation = (() => {
      if (targetWidth === originalWidth && targetHeight === originalHeight) {
        return undefined;
      }

      // Calculate scale factor based on the dimension that was limited
      const scaleX = targetWidth / originalWidth;
      const scaleY = targetHeight / originalHeight;
      // Use the smaller scale factor to ensure both dimensions fit within limits
      const scaleFactor = Math.min(scaleX, scaleY);

      return {
        mode: "scale" as const,
        scale: scaleFactor,
      };
    })();

    const result = await convertMedia({
      audioCodec: "aac",
      container: "mp4",
      // expectedDurationInSeconds: options.duration,
      // expectedFrameRate: Math.min(originalFps, options.maxFps),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onAudioTrack: ({ track, defaultAudioCodec, canCopyTrack }) =>
        // // if (!track) return { type: "drop" };

        // // // Audio should now be compatible 16-bit PCM/AAC
        // // if (canCopyTrack && defaultAudioCodec === "aac") {
        // //   console.log("Copying preprocessed audio track");
        // //   return { type: "copy" };
        // // }

        // console.log("Re-encoding preprocessed audio to AAC");
        // return {
        //   type: "reencode",
        //   audioCodec: "aac",
        //   bitrate: options.audioBitrate,
        //   sampleRate: options.audioSampleRate,
        // };
        ({ type: "copy" }),
      onProgress: ({ overallProgress }) => {
        if (overallProgress) {
          onProgress(Math.round(overallProgress * 100));
          console.log(
            `WebCodecs conversion progress: ${Math.round(overallProgress * 100)}%`,
          );
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onVideoTrack: ({ track, defaultVideoCodec, canCopyTrack }) => {
        // if (
        //   canCopyTrack &&
        //   targetWidth === originalWidth &&
        //   targetHeight === originalHeight &&
        //   originalFps <= options.maxFps
        // ) {
        //   console.log("Copying video track");
        //   return { type: "copy" };
        // }

        console.log("Re-encoding video track");
        return {
          // bitrate: targetBitrate,
          // crf: options.crf,
          type: "reencode",
          videoCodec: "h264",
        };
      },
      resize: resizeOperation,
      src: videoWithProcessedAudio,
      videoCodec: "h264",
    });

    const blob = await result.save();
    const arrayBuffer = await blob.arrayBuffer();
    await result.remove();

    return new Uint8Array(arrayBuffer);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Convert video failed";
    console.error(
      "WebCodecs conversion after FFmpeg preprocessing failed:",
      err,
    );
    throw new Error(`Video conversion failed: ${errMessage}`, { cause: err });
  }
}

export { convertVideoRemotion, type ConvertVideoRemotionOptions };
