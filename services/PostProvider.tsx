"use client";

import { ReactNode, use, useMemo, useState } from "react";

import {
  DEBUG_MEDIA,
  DEBUG_STOP_AFTER_CONVERSION,
  DEBUG_STOP_AFTER_STORAGE,
} from "@/config/constants";
import { sleep } from "@/lib/utils";
import { convertToHLS, type HLSFiles } from "@/lib/video/hls";
import { convertVideoRemotion } from "@/lib/video/remotion";
import { trimVideo } from "@/lib/video/trim";
import {
  getVideoDuration,
  // downloadFile,
} from "@/lib/video/video";
import { BlueskyContext } from "@/services/post/bluesky/Context";
import { FacebookContext } from "@/services/post/facebook/Context";
import { InstagramContext } from "@/services/post/instagram/Context";
import { NeynarContext } from "@/services/post/neynar/Context";
import { ThreadsContext } from "@/services/post/threads/Context";
import { TiktokContext } from "@/services/post/tiktok/Context";
import { TwitterContext } from "@/services/post/twitter/Context";
import { YoutubeContext } from "@/services/post/youtube/Context";
import {
  type CreatePostProps,
  PostContext,
  type PostVideo,
} from "@/services/PostContext";
import { AmazonS3Context } from "@/services/storage/amazons3/Context";
import { PinataContext } from "@/services/storage/pinata/Context";

interface Props {
  children: ReactNode;
}

export function PostProvider({ children }: Readonly<Props>) {
  // Post services.
  const bluesky = use(BlueskyContext);
  const facebook = use(FacebookContext);
  const instagram = use(InstagramContext);
  const neynar = use(NeynarContext);
  const threads = use(ThreadsContext);
  const tiktok = use(TiktokContext);
  const twitter = use(TwitterContext);
  const youtube = use(YoutubeContext);

  // Storage services.
  const pinata = use(PinataContext);
  const amazonS3 = use(AmazonS3Context);

  function resetPostState(): void {
    bluesky.resetPostState();
    facebook.resetPostState();
    instagram.resetPostState();
    neynar.resetPostState();
    threads.resetPostState();
    tiktok.resetPostState();
    twitter.resetPostState();
    youtube.resetPostState();
  }

  function resetStoreState(): void {
    pinata.resetStoreState();
    amazonS3.resetStoreState();
  }

  const isStoring = pinata.isStoring || amazonS3.isStoring;

  const isPosting =
    bluesky.isPosting ||
    facebook.isPosting ||
    instagram.isPosting ||
    neynar.isPosting ||
    threads.isPosting ||
    tiktok.isPosting ||
    twitter.isPosting ||
    youtube.isPosting;

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [videoFileSize, setVideoFileSize] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCodecInfo, setVideoCodecInfo] = useState<string>("");

  const [videoConversionStatus, setVideoConversionStatus] = useState("");
  const [videoConversionProgress, setVideoConversionProgress] = useState(0);
  const [videoConversionError, setVideoConversionError] = useState("");
  const [isVideoConverting, setIsVideoConverting] = useState(false);

  const [videoTrimStatus, setVideoTrimStatus] = useState("");
  const [videoTrimProgress, setVideoTrimProgress] = useState(0);
  const [videoTrimError, setVideoTrimError] = useState("");
  const [isVideoTrimming, setIsVideoTrimming] = useState(false);

  const [hlsConversionStatus, setHLSConversionStatus] = useState("");
  const [hlsConversionProgress, setHLSConversionProgress] = useState(0);
  const [hlsConversionError, setHLSConversionError] = useState("");
  const [isHLSConverting, setIsHLSConverting] = useState(false);

  const canPostToAllServices = useMemo(
    () =>
      (!bluesky.isEnabled || bluesky.isUsable) &&
      (!facebook.isEnabled || facebook.isUsable) &&
      (!instagram.isEnabled || instagram.isUsable) &&
      (!neynar.isEnabled || neynar.isUsable) &&
      (!threads.isEnabled || threads.isUsable) &&
      (!tiktok.isEnabled || tiktok.isUsable) &&
      (!twitter.isEnabled || twitter.isUsable) &&
      (!youtube.isEnabled || youtube.isUsable),
    [
      bluesky.isEnabled,
      bluesky.isUsable,
      facebook.isEnabled,
      facebook.isUsable,
      instagram.isEnabled,
      instagram.isUsable,
      neynar.isEnabled,
      neynar.isUsable,
      threads.isEnabled,
      threads.isUsable,
      tiktok.isEnabled,
      tiktok.isUsable,
      twitter.isEnabled,
      twitter.isUsable,
      youtube.isEnabled,
      youtube.isUsable,
    ],
  );

  const canStoreToAllServices = useMemo(
    () =>
      (!pinata.isEnabled || pinata.isUsable) &&
      (!amazonS3.isEnabled || amazonS3.isUsable),
    [pinata.isEnabled, pinata.isUsable, amazonS3.isEnabled, amazonS3.isUsable],
  );

  async function getVideoInfo(video: File | null): Promise<void> {
    if (video) {
      setVideoPreviewUrl(URL.createObjectURL(video));
      setVideoFileSize(video.size);
      setVideoDuration(await getVideoDuration(video));

      return;
    }

    setVideoPreviewUrl("");
    setVideoFileSize(0);
    setVideoDuration(0);
    setVideoCodecInfo("");
  }

  // Convert video file to optimized format
  async function convertVideo(video: File): Promise<File> {
    try {
      setIsVideoConverting(true);
      setVideoConversionProgress(0);
      setVideoConversionStatus("Preparing video...");

      if (DEBUG_MEDIA) {
        console.log("DEBUG MODE: Skipping video conversion.");
        await sleep(1);
        setVideoConversionProgress(100);
        // await sleep(1000);
        // setVideoConversionProgress(20);
        // await sleep(1000);
        // setVideoConversionProgress(40);
        // await sleep(1000);
        // setVideoConversionProgress(60);
        // await sleep(1000);
        // setVideoConversionProgress(80);
        // await sleep(1000);
        // setVideoConversionProgress(100);

        return video;
      }

      console.log("Starting video conversion...");
      const convertedData = await convertVideoRemotion(
        video,
        {
          audioBitrate: 128000,
          audioSampleRate: 48000,
          // duration: videoDuration,
          // maxFileSizeMB: 20,
          maxFps: 60,
          maxWidth: 1920,
        },
        setVideoConversionProgress,
        setVideoConversionStatus,
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
      setVideoConversionProgress(100);

      // downloadFile(convertedVideo);

      return convertedVideo;
    } catch (err: unknown) {
      console.error("Video conversion failed:", err);
      setVideoConversionError("Failed to convert video.");
      throw err;
    } finally {
      setIsVideoConverting(false);
      setVideoConversionProgress(0);
    }
  }

  async function convertHLSVideo(video: File): Promise<HLSFiles> {
    try {
      setIsHLSConverting(true);
      setHLSConversionStatus(
        "Creating HLS video for optimal Farcaster display...",
      );
      setHLSConversionProgress(0);

      if (DEBUG_MEDIA) {
        console.log("DEBUG MODE: Skipping HLS conversion.");
        await sleep(1);
        setHLSConversionProgress(100);
        // await sleep(1000);
        // setHLSConversionProgress(20);
        // await sleep(1000);
        // setHLSConversionProgress(40);
        // await sleep(1000);
        // setHLSConversionProgress(60);
        // await sleep(1000);
        // setHLSConversionProgress(80);
        // await sleep(1000);
        // setHLSConversionProgress(100);

        return {
          masterManifest: video,
          segments: [],
          streamManifest: video,
          thumbnail: video,
        };
      }

      // Convert to HLS (try copy first, fallback to encoding if needed)
      console.log("Converting video to HLS format...");
      const hlsFiles = await convertToHLS(video, setHLSConversionProgress);
      console.log(hlsFiles);

      console.log("HLS conversion successful");

      return hlsFiles;
    } catch (err: unknown) {
      console.error("HLS conversion/upload failed:", err);
      setHLSConversionError("Failed to convert video to HLS format.");
      throw err;
    } finally {
      setIsHLSConverting(false);
      setHLSConversionProgress(0);
    }
  }

  async function trimPlatformVideos(
    videos: Record<string, PostVideo>,
  ): Promise<Record<string, PostVideo>> {
    try {
      setIsVideoTrimming(true);
      setVideoTrimStatus("Trimming videos for platform constraints...");
      setVideoTrimProgress(0);

      if (videos.full.video === null) {
        throw new Error("Base video is missing.");
      }

      /* eslint-disable require-atomic-updates */
      if (bluesky.isEnabled) {
        setVideoTrimStatus("Trimming bluesky video if needed...");
        videos.bluesky = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "bluesky",
                maxDuration: bluesky.VIDEO_MAX_DURATION,
                maxFilesize: bluesky.VIDEO_MAX_FILESIZE,
                minDuration: bluesky.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (facebook.isEnabled) {
        setVideoTrimStatus("Trimming facebook video if needed...");
        videos.facebook = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: facebook.id,
                maxDuration: facebook.VIDEO_MAX_DURATION,
                maxFilesize: facebook.VIDEO_MAX_FILESIZE,
                minDuration: facebook.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (instagram.isEnabled) {
        setVideoTrimStatus("Trimming instagram video if needed...");
        videos.instagram = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: instagram.id,
                maxDuration: instagram.VIDEO_MAX_DURATION,
                maxFilesize: instagram.VIDEO_MAX_FILESIZE,
                minDuration: instagram.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (neynar.isEnabled) {
        setVideoTrimStatus("Trimming farcaster video if needed...");
        videos.neynar = {
          // video: DEBUG_MEDIA
          //   ? videos.full.video
          //   : await trimVideo({
          //       label: neynar.id,
          //       maxDuration: neynar.VIDEO_MAX_DURATION,
          //       maxFilesize: neynar.VIDEO_MAX_FILESIZE,
          //       minDuration: neynar.VIDEO_MIN_DURATION,
          //       onProgress: setVideoTrimProgress,
          //       video: videos.full.video,
          //     }),
          video: null,
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (threads.isEnabled) {
        setVideoTrimStatus("Trimming threads video if needed...");
        videos.threads = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: threads.id,
                maxDuration: threads.VIDEO_MAX_DURATION,
                maxFilesize: threads.VIDEO_MAX_FILESIZE,
                minDuration: threads.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (tiktok.isEnabled) {
        setVideoTrimStatus("Trimming tiktok video if needed...");
        videos.tiktok = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: tiktok.id,
                maxDuration: tiktok.VIDEO_MAX_DURATION,
                maxFilesize: tiktok.VIDEO_MAX_FILESIZE,
                minDuration: tiktok.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (twitter.isEnabled) {
        setVideoTrimStatus("Trimming twitter video if needed...");
        videos.twitter = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: twitter.id,
                maxDuration: twitter.VIDEO_MAX_DURATION,
                maxFilesize: twitter.VIDEO_MAX_FILESIZE,
                minDuration: twitter.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }

      if (youtube.isEnabled) {
        setVideoTrimStatus("Trimming youtube video if needed...");
        videos.youtube = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: youtube.id,
                maxDuration: youtube.VIDEO_MAX_DURATION,
                maxFilesize: youtube.VIDEO_MAX_FILESIZE,
                minDuration: youtube.VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      /* eslint-enable require-atomic-updates */

      return videos;
    } catch (err: unknown) {
      console.error("Platform video trimming failed:", err);
      setVideoTrimError("Failed to trim some videos.");
      throw err;
    } finally {
      setIsVideoTrimming(false);
      setVideoTrimProgress(0);
    }
  }

  async function preparePostVideo(
    selectedFile: File,
  ): Promise<Record<string, PostVideo>> {
    const needsHls = neynar.isEnabled;
    // const needsS3 = tiktok.isEnabled;

    if (!pinata.isUsable && !amazonS3.isUsable) {
      throw new Error("You must enable a storage provider.");
    }

    // if (needsS3 && !amazonS3.isUsable && tiktok.isUsable) {
    //   throw new Error(
    //     "To use TikTok at least one non-ipfs storage provider must be enabled. (Amazon S3).",
    //   );
    // }

    if (needsHls && !pinata.isUsable) {
      throw new Error(
        "To use Farcaster or Lens at least one enabled storage provider must support IPFS or Arweave. (Pinata).",
      );
    }

    if (!pinata.isUsable && !amazonS3.isUsable) {
      throw new Error("You must enable a storage provider.");
    }

    let videos: Record<string, PostVideo> = {
      full: {
        video: null,
        videoHSLUrl: "",
        videoUrl: "",
      },
    };

    // Convert video if file is selected.
    // -------------------------------------------------------------------------
    console.log("Converting video to H264/AAC before upload...");
    videos.full.video = await convertVideo(selectedFile);
    // videos.full.video = selectedFile;
    // -------------------------------------------------------------------------

    // Make HLS Streamable video
    // -------------------------------------------------------------------------
    let hlsFiles: HLSFiles | null = null;
    if (needsHls) {
      console.log("Converting HLS video before upload...");
      hlsFiles = await convertHLSVideo(videos.full.video);
    }
    // -------------------------------------------------------------------------

    // Trim platform specific videos
    // -------------------------------------------------------------------------
    console.log("Converting HLS video before upload...");
    videos = await trimPlatformVideos(videos);
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    console.log(videos);

    if (DEBUG_STOP_AFTER_CONVERSION) {
      throw new Error("TESTING CONVERSION ONLY");
    }
    // -------------------------------------------------------------------------

    // Upload video to storage.
    // -------------------------------------------------------------------------
    console.log("Uploading video to remote storage...");

    for (const [videoId, videoData] of Object.entries(videos)) {
      if (videoData.video) {
        let videoUrl = "";

        // eslint-disable-next-line no-await-in-loop
        const s3VideoResult = await amazonS3.storeVideo(
          videoData.video,
          videoId,
        );
        if (s3VideoResult) {
          videoUrl = s3VideoResult;
        }

        // eslint-disable-next-line no-await-in-loop
        const pinataVideoResult = await pinata.storeVideo(
          videoData.video,
          videoId,
        );
        if (pinataVideoResult) {
          videoUrl = pinataVideoResult;
        }

        // TikTok can't work with IPFS as the domain cannot be verified.
        // if (videoId === "tiktok") {
        //   videoUrl = s3VideoResult;
        // }

        if (!videoUrl) {
          console.error(`Failed to upload ${videoId} video to storage.`);
          throw new Error(`Failed to upload ${videoId} video to storage.`);
        }

        console.log("Video upload successful:", videoUrl);

        videos[videoId].videoUrl = videoUrl;
      }
    }
    // -------------------------------------------------------------------------

    // Upload HLS Streamable video to storage.
    // -------------------------------------------------------------------------
    if (needsHls && hlsFiles) {
      // Upload HLS files to Pinata
      console.log("Uploading HLS files to Pinata...");
      const videoHSLUrl = await pinata.storeHLSFolder(
        hlsFiles,
        `hls-video-${Date.now()}`,
        "HLS",
      );

      if (!videoHSLUrl) {
        throw new Error("Failed to upload HLS files to Pinata");
      }

      console.log("HLS upload successful:", videoHSLUrl);

      videos.neynar.videoHSLUrl = videoHSLUrl;
    }
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    console.log(videos);

    if (DEBUG_STOP_AFTER_STORAGE) {
      throw new Error("TESTING STORAGE ONLY");
    }
    // -------------------------------------------------------------------------

    return videos;
  }

  async function createPost({
    facebookPrivacy,
    text,
    title,
    videos,
    youtubePrivacy,
  }: Readonly<CreatePostProps>): Promise<void> {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-condition */
    const allResults = await Promise.allSettled([
      bluesky.post({
        privacy: "",
        text,
        title,
        userId: bluesky.accounts[0]?.id,
        username: bluesky.accounts[0]?.username,
        video: videos.bluesky?.video || videos.full.video,
        videoHSLUrl: videos.bluesky?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.bluesky?.videoUrl || videos.full.videoUrl,
      }),
      facebook.post({
        privacy: facebookPrivacy,
        text,
        title,
        userId: facebook.accounts[0]?.id,
        username: facebook.accounts[0]?.username,
        video: videos.facebook?.video || videos.full.video,
        videoHSLUrl: videos.facebook?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.facebook?.videoUrl || videos.full.videoUrl,
      }),
      instagram.post({
        privacy: "",
        text,
        title,
        userId: instagram.accounts[0]?.id,
        username: instagram.accounts[0]?.username,
        video: videos.instagram?.video || videos.full.video,
        videoHSLUrl: videos.instagram?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.instagram?.videoUrl || videos.full.videoUrl,
      }),
      neynar.post({
        privacy: "",
        text,
        title,
        userId: neynar.accounts[0]?.id,
        username: neynar.accounts[0]?.username,
        video: videos.neynar?.video || videos.full.video,
        videoHSLUrl: videos.neynar?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.neynar?.videoUrl || videos.full.videoUrl,
      }),
      threads.post({
        privacy: "",
        text,
        title,
        userId: threads.accounts[0]?.id,
        username: threads.accounts[0]?.username,
        video: videos.threads?.video || videos.full.video,
        videoHSLUrl: videos.threads?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.threads?.videoUrl || videos.full.videoUrl,
      }),
      tiktok.post({
        privacy: "",
        text,
        title,
        userId: tiktok.accounts[0]?.id,
        username: tiktok.accounts[0]?.username,
        video: videos.tiktok?.video || videos.full.video,
        videoHSLUrl: videos.tiktok?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.tiktok?.videoUrl || videos.full.videoUrl,
      }),
      twitter.post({
        privacy: "",
        text,
        title,
        userId: twitter.accounts[0]?.id,
        username: twitter.accounts[0]?.username,
        video: videos.twitter?.video || videos.full.video,
        videoHSLUrl: videos.twitter?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.twitter?.videoUrl || videos.full.videoUrl,
      }),
      youtube.post({
        privacy: youtubePrivacy,
        text,
        title,
        userId: youtube.accounts[0]?.id,
        username: youtube.accounts[0]?.username,
        video: videos.youtube?.video || videos.full.video,
        videoHSLUrl: videos.youtube?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.youtube?.videoUrl || videos.full.videoUrl,
      }),
    ]);
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-condition */

    console.log("All results:", allResults);
  }

  const providerValues = useMemo(
    () => ({
      canPostToAllServices,
      canStoreToAllServices,
      createPost,
      getVideoInfo,
      hlsConversionError,
      hlsConversionProgress,
      hlsConversionStatus,
      isHLSConverting,
      isPosting,
      isStoring,
      isVideoConverting,
      isVideoTrimming,
      preparePostVideo,
      resetPostState,
      resetStoreState,
      videoCodecInfo,
      videoConversionError,
      videoConversionProgress,
      videoConversionStatus,
      videoDuration,
      videoFileSize,
      videoPreviewUrl,
      videoTrimError,
      videoTrimProgress,
      videoTrimStatus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canPostToAllServices,
      canStoreToAllServices,
      hlsConversionError,
      hlsConversionProgress,
      hlsConversionStatus,
      isHLSConverting,
      isPosting,
      isStoring,
      isVideoConverting,
      isVideoTrimming,
      preparePostVideo,
      resetPostState,
      resetStoreState,
      videoCodecInfo,
      videoConversionError,
      videoConversionProgress,
      videoConversionStatus,
      videoDuration,
      videoFileSize,
      videoPreviewUrl,
      videoTrimError,
      videoTrimProgress,
      videoTrimStatus,
    ],
  );

  return (
    <PostContext.Provider value={providerValues}>
      {children}
    </PostContext.Provider>
  );
}
