import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  // QUALITY_HIGH,
  // QUALITY_LOW,
  QUALITY_MEDIUM,
} from "mediabunny";

import {
  combineAudioVideo,
  convertAudioTo16BitPCM,
  extractVideoOnly,
} from "@/lib/video/audio";
// import { calculateTargetBitrate } from "@/lib/video/video";

interface ConvertVideoMediabunnyOptions {
  audioBitrate: number;
  audioSampleRate: number;
  // duration: number;
  // maxFileSizeMB: number;
  maxWidth: number;
  maxFps: number;
}

// Helper function to convert bitrate to MediaBunny quality constants
// function getQualityFromBitrate(bitrate: number): number | typeof QUALITY_HIGH {
//   if (bitrate < 1000) return QUALITY_LOW;
//   if (bitrate < 5000) return QUALITY_MEDIUM;
//   if (bitrate < 15000) return QUALITY_HIGH;

//   // Convert kbps to bps for custom bitrate
//   return bitrate * 1000;
// }

async function convertVideoMediabunny(
  file: File,
  options: ConvertVideoMediabunnyOptions,
  onProgress: (progress: number) => void,
  setVideoConversionStatus: (status: string) => void,
): Promise<Uint8Array> {
  // Check WebCodecs support
  if (!("VideoEncoder" in window) || !("VideoDecoder" in window)) {
    throw new Error("WebCodecs is not supported in this browser");
  }

  try {
    console.log(
      "Converting with MediaBunny after FFmpeg audio preprocessing...",
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

    // Step 3: Now use MediaBunny on the file with compatible audio

    // Create input from the preprocessed video file
    const input = new Input({
      formats: ALL_FORMATS,
      source: new BlobSource(videoWithProcessedAudio),
    });

    // Get video metadata
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) {
      throw new Error("No video track found in input file");
    }

    const { displayWidth: originalWidth, displayHeight: originalHeight } =
      videoTrack;

    console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);

    // Calculate target dimensions
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > options.maxWidth) {
      const aspectRatio = originalHeight / originalWidth;
      targetWidth = options.maxWidth;
      targetHeight = Math.round(options.maxWidth * aspectRatio);
    }

    // Ensure dimensions are even (required for most video codecs)
    targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
    targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

    console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);

    // Calculate target bitrate
    // const targetSizeMB = options.maxFileSizeMB * 0.95;
    // const targetBitrate = calculateTargetBitrate(
    //   options.duration,
    //   targetSizeMB,
    //   options.audioBitrate,
    // );
    // console.log(`Target bitrate: ${targetBitrate} kbps`);

    // Create output configuration
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });

    // Determine if we need to resize
    const needsResize =
      targetWidth !== originalWidth || targetHeight !== originalHeight;

    // Initialize conversion with MediaBunny
    const conversion = await Conversion.init({
      audio: {
        // // Convert kbps to bps
        // bitrate: options.audioBitrate * 1000,
        // // Copy the already processed audio
        // codec: "aac",
        // sampleRate: options.audioSampleRate,
        // Copy the audio track without re-encoding
        forceTranscode: false,
      },
      input,
      output,
      video: {
        // bitrate: getQualityFromBitrate(targetBitrate),
        bitrate: QUALITY_MEDIUM,
        // H.264
        codec: "avc",
        ...(options.maxFps && {
          frameRate: Math.min(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            videoTrack.computePacketStats
              ? (await videoTrack.computePacketStats(100)).averagePacketRate ||
                  options.maxFps
              : options.maxFps,
            options.maxFps,
          ),
        }),
        ...(needsResize && {
          height: targetHeight,
          width: targetWidth,
        }),
      },
    });

    conversion.onProgress = (progress: number) => {
      // MediaBunny provides progress as 0-1, convert to 0-100
      const progressPercent = Math.round(progress * 100);
      onProgress(progressPercent);
      console.log(`MediaBunny conversion progress: ${progressPercent}%`);
    };

    // Execute the conversion
    await conversion.execute();

    // Get the output buffer
    const outputBuffer = output.target.buffer;

    if (outputBuffer === null) {
      throw new Error("Conversion failed: No output buffer generated");
    }

    console.log(
      `Conversion complete. Output size: ${(outputBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`,
    );

    return new Uint8Array(outputBuffer);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Convert video failed";
    console.error(
      "MediaBunny conversion after FFmpeg preprocessing failed:",
      err,
    );
    throw new Error(`Video conversion failed: ${errMessage}`, { cause: err });
  }
}

export { convertVideoMediabunny, type ConvertVideoMediabunnyOptions };
