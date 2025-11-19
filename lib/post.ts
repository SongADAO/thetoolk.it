import { DEBUG_DOWNLOAD_MEDIA, DEBUG_MEDIA } from "@/config/constants";
import type { PostVideo } from "@/contexts/CreatePostContext";
import { sleep } from "@/lib/utils";
import { convertToHLS, type HLSFiles } from "@/lib/video/hls";
import { convertVideoMediabunny } from "@/lib/video/mediabunny";
import { trimVideo } from "@/lib/video/trim";
import { downloadFile } from "@/lib/video/video";
import type { PostServiceContextType } from "@/services/post/PostServiceContext";

interface ConvertVideoProps {
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
  video: File;
}

// Convert video file to optimized format
async function convertVideo({
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
  video,
}: Readonly<ConvertVideoProps>): Promise<File> {
  try {
    setIsProcessing(true);
    setProcessProgress(0);
    setProcessStatus("Preparing video...");

    if (DEBUG_MEDIA) {
      console.log("DEBUG MODE: Skipping video conversion.");
      await sleep(1);
      setProcessProgress(100);
      // await sleep(1000);
      // setProcessProgress(20);
      // await sleep(1000);
      // setProcessProgress(40);
      // await sleep(1000);
      // setProcessProgress(60);
      // await sleep(1000);
      // setProcessProgress(80);
      // await sleep(1000);
      // setProcessProgress(100);

      return video;
    }

    console.log("Starting video conversion...");
    const convertedData = await convertVideoMediabunny(
      video,
      {
        audioBitrate: 128000,
        audioSampleRate: 48000,
        // duration: videoDuration,
        // maxFileSizeMB: 20,
        maxFps: 60,
        maxWidth: 1920,
      },
      setProcessProgress,
      setProcessStatus,
    );

    // Convert Uint8Array back to File object
    const convertedVideo = new File(
      [convertedData as BlobPart],
      `converted_${video.name}`,
      { type: "video/mp4" },
    );
    console.log(convertedVideo);

    console.log(
      `Conversion complete! Original: ${(video.size / 1024 / 1024).toFixed(2)}MB -> Converted: ${(convertedVideo.size / 1024 / 1024).toFixed(2)}MB`,
    );
    setProcessProgress(100);

    if (DEBUG_DOWNLOAD_MEDIA) {
      downloadFile(convertedVideo);
      throw new Error("TESTING CONVERSION ONLY");
    }

    return convertedVideo;
  } catch (err: unknown) {
    console.error("Video conversion failed:", err);
    setProcessError("Failed to convert video.");
    throw err;
  } finally {
    setIsProcessing(false);
    setProcessProgress(0);
  }
}

interface ConvertHLSVideoProps {
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
  video: File;
}

async function convertHLSVideo({
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
  video,
}: Readonly<ConvertHLSVideoProps>): Promise<HLSFiles> {
  try {
    setIsProcessing(true);
    setProcessStatus("Creating HLS video for optimal Farcaster display...");
    setProcessProgress(0);

    if (DEBUG_MEDIA) {
      console.log("DEBUG MODE: Skipping HLS conversion.");
      await sleep(1);
      setProcessProgress(100);
      // await sleep(1000);
      // setProcessProgress(20);
      // await sleep(1000);
      // setProcessProgress(40);
      // await sleep(1000);
      // setProcessProgress(60);
      // await sleep(1000);
      // setProcessProgress(80);
      // await sleep(1000);
      // setProcessProgress(100);

      return {
        masterManifest: video,
        segments: [],
        streamManifest: video,
        thumbnail: video,
      };
    }

    // Convert to HLS (try copy first, fallback to encoding if needed)
    console.log("Converting video to HLS format...");
    const hlsFiles = await convertToHLS(video, setProcessProgress);
    console.log(hlsFiles);

    console.log("HLS conversion successful");

    return hlsFiles;
  } catch (err: unknown) {
    console.error("HLS conversion/upload failed:", err);
    setProcessError("Failed to convert video to HLS format.");
    throw err;
  } finally {
    setIsProcessing(false);
    setProcessProgress(0);
  }
}

interface TrimPlatformVideoProps {
  setProcessProgress: (progress: number) => void;
  platform: PostServiceContextType;
  video: File;
}

async function trimPlatformVideo({
  setProcessProgress,
  platform,
  video,
}: Readonly<TrimPlatformVideoProps>): Promise<File | null> {
  if (DEBUG_MEDIA) {
    return video;
  }

  const maxDuration =
    platform.accounts[0]?.permissions?.max_video_post_duration_sec ??
    platform.VIDEO_MAX_DURATION;

  return await trimVideo({
    label: platform.id,
    maxDuration,
    maxFilesize: platform.VIDEO_MAX_FILESIZE,
    minDuration: platform.VIDEO_MIN_DURATION,
    onProgress: setProcessProgress,
    video,
  });
}

interface TrimPlatformVideosProps {
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessError: (error: string) => void;
  setProcessProgress: (progress: number) => void;
  setProcessStatus: (status: string) => void;
  platforms: PostServiceContextType[];
  video: File;
}

async function trimPlatformVideos({
  setIsProcessing,
  setProcessError,
  setProcessProgress,
  setProcessStatus,
  platforms,
  video,
}: Readonly<TrimPlatformVideosProps>): Promise<Record<string, PostVideo>> {
  try {
    setIsProcessing(true);
    setProcessStatus("Trimming videos for platform constraints...");
    setProcessProgress(0);

    const videos: Record<string, PostVideo> = {
      full: {
        video,
        videoHSLUrl: null,
        videoUrl: null,
      },
    };

    for (const platform of platforms) {
      if (platform.isEnabled) {
        setProcessStatus(`Trimming ${platform.id} video if needed...`);

        // eslint-disable-next-line require-atomic-updates
        videos[platform.id] = {
          // eslint-disable-next-line no-await-in-loop
          video: await trimPlatformVideo({
            platform,
            setProcessProgress,
            video,
          }),
          videoHSLUrl: null,
          videoUrl: null,
        };
      }
    }

    return videos;
  } catch (err: unknown) {
    console.error("Platform video trimming failed:", err);
    setProcessError("Failed to trim some videos.");
    throw err;
  } finally {
    setIsProcessing(false);
    setProcessProgress(0);
  }
}

export { convertHLSVideo, convertVideo, trimPlatformVideos };
