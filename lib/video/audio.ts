import { cleanupFFmpeg, initializeFFmpeg } from "@/lib/video/ffmpeg";

// Convert 32-bit audio to 16-bit PCM stereo using FFmpeg
async function convertAudioTo16BitPCM(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  // Initialize FFmpeg
  console.log("Initializing FFmpeg...");
  const ffmpeg = await initializeFFmpeg(onProgress);

  try {
    console.log("Converting audio to 16-bit PCM using FFmpeg...");

    // Write input file to FFmpeg filesystem
    const inputFileName = `input.${file.name.split(".").pop()}`;
    const outputFileName = "output_audio.wav";

    await ffmpeg.writeFile(
      inputFileName,
      new Uint8Array(await file.arrayBuffer()),
    );

    // FFmpeg command to extract and convert audio:
    // -i input: input file
    // -vn: no video (audio only)
    // -acodec pcm_s16le: 16-bit PCM little endian
    // -ac 2: stereo (2 channels)
    // -ar 44100: 44.1kHz sample rate (you can change this)
    await ffmpeg.exec([
      "-i",
      inputFileName,
      // No video
      "-vn",
      // 16-bit PCM
      "-acodec",
      "pcm_s16le",
      // Stereo
      "-ac",
      "2",
      // sample rate
      "-ar",
      // "44100",
      "48000",
      outputFileName,
    ]);

    // Read the output file
    const audioData = await ffmpeg.readFile(outputFileName);

    // Clean up
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // Create audio file
    const audioBlob = new Blob([audioData as BlobPart], {
      type: "audio/wav",
    });
    const audioFile = new File([audioBlob], "converted_audio.wav", {
      type: "audio/wav",
    });

    console.log(
      `Audio converted to 16-bit PCM: ${(audioBlob.size / 1024).toFixed(2)}KB`,
    );
    return audioFile;
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Audio conversion failed";
    console.error("FFmpeg audio conversion error:", err);
    throw new Error(`Audio conversion failed: ${errMessage}`, { cause: err });
  } finally {
    cleanupFFmpeg();
  }
}

// Extract video without audio (for separate processing)
async function extractVideoOnly(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  // Initialize FFmpeg
  console.log("Initializing FFmpeg...");
  const ffmpeg = await initializeFFmpeg(onProgress);

  try {
    console.log("Extracting video track (no audio)...");

    const inputFileName = `input.${file.name.split(".").pop()}`;
    const outputFileName = "video_only.mp4";

    await ffmpeg.writeFile(
      inputFileName,
      new Uint8Array(await file.arrayBuffer()),
    );

    // Extract video only
    await ffmpeg.exec([
      "-i",
      inputFileName,
      // No audio
      "-an",
      // Copy video without re-encoding
      "-vcodec",
      "copy",
      outputFileName,
    ]);

    const videoData = await ffmpeg.readFile(outputFileName);

    // Clean up
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    const videoBlob = new Blob([videoData as BlobPart], {
      type: "video/mp4",
    });
    const videoFile = new File([videoBlob], "video_only.mp4", {
      type: "video/mp4",
    });

    console.log(
      `Video extracted: ${(videoBlob.size / (1024 * 1024)).toFixed(2)}MB`,
    );
    return videoFile;
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Extract video failed";
    console.error("FFmpeg video extraction error:", err);
    throw new Error(`Video extraction failed: ${errMessage}`, { cause: err });
  } finally {
    cleanupFFmpeg();
  }
}

// Combine processed audio with video using FFmpeg (alternative to webcodecs)
async function combineAudioVideo(
  videoFile: File,
  audioFile: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  // Initialize FFmpeg
  console.log("Initializing FFmpeg...");
  const ffmpeg = await initializeFFmpeg(onProgress);

  try {
    console.log("Combining audio and video with FFmpeg...");

    const videoFileName = "video.mp4";
    const audioFileName = "audio.wav";
    const outputFileName = "combined.mp4";

    await ffmpeg.writeFile(
      videoFileName,
      new Uint8Array(await videoFile.arrayBuffer()),
    );
    await ffmpeg.writeFile(
      audioFileName,
      new Uint8Array(await audioFile.arrayBuffer()),
    );

    // Combine audio and video
    await ffmpeg.exec([
      // Video input
      "-i",
      videoFileName,
      // Audio input
      "-i",
      audioFileName,
      // Copy video without re-encoding
      "-c:v",
      "copy",
      // Encode audio as AAC
      "-c:a",
      "aac",
      // Audio bitrate
      "-b:a",
      "128k",
      // Match shortest stream duration
      "-shortest",
      outputFileName,
    ]);

    const combinedData = await ffmpeg.readFile(outputFileName);

    // Clean up
    await ffmpeg.deleteFile(videoFileName);
    await ffmpeg.deleteFile(audioFileName);
    await ffmpeg.deleteFile(outputFileName);

    const combinedBlob = new Blob([combinedData as BlobPart], {
      type: "video/mp4",
    });
    const combinedFile = new File([combinedBlob], "combined_output.mp4", {
      type: "video/mp4",
    });

    console.log(
      `Combined file: ${(combinedBlob.size / (1024 * 1024)).toFixed(2)}MB`,
    );
    return combinedFile;
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "combine Audio Video failed";
    console.error("FFmpeg combine error:", err);
    throw new Error(`Combining failed: ${errMessage}`, { cause: err });
  } finally {
    cleanupFFmpeg();
  }
}

export {
  cleanupFFmpeg,
  combineAudioVideo,
  convertAudioTo16BitPCM,
  extractVideoOnly,
};
