"use client";

import { ReactNode, use, useMemo, useState } from "react";

import {
  DEBUG_MEDIA,
  DEBUG_STOP_AFTER_CONVERSION,
  DEBUG_STOP_AFTER_STORAGE,
} from "@/config/constants";
import { HLSConverter, type HLSFiles } from "@/lib/hls-converter";
import { sleep } from "@/lib/utils";
import {
  // getVideoCodecInfo,
  getVideoDuration,
} from "@/lib/video";
// import { VideoConverter } from "@/lib/video-converter-ffmpeg";
import { VideoConverter } from "@/lib/video-converter-webcodecs";
import {
  cleanupFFmpeg as cleanupFFmpegTrim,
  trimVideo,
} from "@/lib/video-trimmer";
// import { validateVideoFile } from "@/lib/video-validator";
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
  const {
    isPosting: blueskyIsPosting,
    isEnabled: blueskyIsEnabled,
    isUsable: blueskyIsUsable,
    accounts: blueskyAccounts,
    post: blueskyPost,
    resetPostState: blueskyResetPostState,
    VIDEO_MAX_DURATION: BLUESKY_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: BLUESKY_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: BLUESKY_VIDEO_MIN_DURATION,
  } = use(BlueskyContext);
  const {
    isPosting: facebookIsPosting,
    isEnabled: facebookIsEnabled,
    isUsable: facebookIsUsable,
    accounts: facebookAccounts,
    post: facebookPost,
    resetPostState: facebookResetPostState,
    VIDEO_MAX_DURATION: FACEBOOK_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: FACEBOOK_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: FACEBOOK_VIDEO_MIN_DURATION,
  } = use(FacebookContext);
  const {
    isPosting: instagramIsPosting,
    isEnabled: instagramIsEnabled,
    isUsable: instagramIsUsable,
    accounts: instagramAccounts,
    post: instagramPost,
    resetPostState: instagramResetPostState,
    VIDEO_MAX_DURATION: INSTAGRAM_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: INSTAGRAM_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: INSTAGRAM_VIDEO_MIN_DURATION,
  } = use(InstagramContext);
  const {
    isPosting: neynarIsPosting,
    isUsable: neynarIsUsable,
    isEnabled: neynarIsEnabled,
    accounts: neynarAccounts,
    post: neynarPost,
    resetPostState: neynarResetPostState,
    // VIDEO_MAX_DURATION: NEYNAR_VIDEO_MAX_DURATION,
    // VIDEO_MAX_FILESIZE: NEYNAR_VIDEO_MAX_FILESIZE,
    // VIDEO_MIN_DURATION: NEYNAR_VIDEO_MIN_DURATION,
  } = use(NeynarContext);
  const {
    isPosting: threadsIsPosting,
    isEnabled: threadsIsEnabled,
    isUsable: threadsIsUsable,
    accounts: threadsAccounts,
    post: threadsPost,
    resetPostState: threadsResetPostState,
    VIDEO_MAX_DURATION: THREADS_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: THREADS_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: THREADS_VIDEO_MIN_DURATION,
  } = use(ThreadsContext);
  const {
    isPosting: tiktokIsPosting,
    isEnabled: tiktokIsEnabled,
    isUsable: tiktokIsUsable,
    accounts: tiktokAccounts,
    post: tiktokPost,
    resetPostState: tiktokResetPostState,
    VIDEO_MAX_DURATION: TIKTOK_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: TIKTOK_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: TIKTOK_VIDEO_MIN_DURATION,
  } = use(TiktokContext);
  const {
    isPosting: twitterIsPosting,
    isEnabled: twitterIsEnabled,
    isUsable: twitterIsUsable,
    accounts: twitterAccounts,
    post: twitterPost,
    resetPostState: twitterResetPostState,
    VIDEO_MAX_DURATION: TWITTER_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: TWITTER_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: TWITTER_VIDEO_MIN_DURATION,
  } = use(TwitterContext);
  const {
    isPosting: youtubeIsPosting,
    isEnabled: youtubeIsEnabled,
    isUsable: youtubeIsUsable,
    accounts: youtubeAccounts,
    post: youtubePost,
    resetPostState: youtubeResetPostState,
    VIDEO_MAX_DURATION: YOUTUBE_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: YOUTUBE_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: YOUTUBE_VIDEO_MIN_DURATION,
  } = use(YoutubeContext);

  const {
    isStoring: pinataIsStoring,
    isEnabled: pinataIsEnabled,
    isUsable: pinataIsUsable,
    resetStoreState: pinataResetStoreState,
    storeVideo: pinataStoreVideo,
    storeHLSFolder: pinataStoreHLSFolder,
  } = use(PinataContext);
  const {
    isStoring: amazonS3IsStoring,
    isEnabled: amazonS3IsEnabled,
    isUsable: amazonS3IsUsable,
    resetStoreState: amazonS3ResetStoreState,
    storeVideo: amazonS3StoreVideo,
  } = use(AmazonS3Context);

  function resetPostState(): void {
    blueskyResetPostState();
    facebookResetPostState();
    instagramResetPostState();
    neynarResetPostState();
    threadsResetPostState();
    tiktokResetPostState();
    twitterResetPostState();
    youtubeResetPostState();
  }

  function resetStoreState(): void {
    pinataResetStoreState();
    amazonS3ResetStoreState();
  }

  const isStoring = pinataIsStoring || amazonS3IsStoring;

  const isPosting =
    blueskyIsPosting ||
    facebookIsPosting ||
    instagramIsPosting ||
    neynarIsPosting ||
    threadsIsPosting ||
    tiktokIsPosting ||
    twitterIsPosting ||
    youtubeIsPosting;

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
      (!blueskyIsEnabled || blueskyIsUsable) &&
      (!facebookIsEnabled || facebookIsUsable) &&
      (!instagramIsEnabled || instagramIsUsable) &&
      (!neynarIsEnabled || neynarIsUsable) &&
      (!threadsIsEnabled || threadsIsUsable) &&
      (!tiktokIsEnabled || tiktokIsUsable) &&
      (!twitterIsEnabled || twitterIsUsable) &&
      (!youtubeIsEnabled || youtubeIsUsable),
    [
      blueskyIsEnabled,
      blueskyIsUsable,
      facebookIsEnabled,
      facebookIsUsable,
      instagramIsEnabled,
      instagramIsUsable,
      neynarIsEnabled,
      neynarIsUsable,
      threadsIsEnabled,
      threadsIsUsable,
      tiktokIsEnabled,
      tiktokIsUsable,
      twitterIsEnabled,
      twitterIsUsable,
      youtubeIsEnabled,
      youtubeIsUsable,
    ],
  );

  const canStoreToAllServices = useMemo(
    () =>
      (!pinataIsEnabled || pinataIsUsable) &&
      (!amazonS3IsEnabled || amazonS3IsUsable),
    [pinataIsEnabled, pinataIsUsable, amazonS3IsEnabled, amazonS3IsUsable],
  );

  function getVideoInfo(video: File | null): void {
    if (video) {
      setVideoPreviewUrl(URL.createObjectURL(video));
      setVideoFileSize(video.size);
      getVideoDuration({ setVideoDuration, video });
      // setVideoCodecInfo(await getVideoCodecInfo(video));

      // console.log("check video info");
      // const result = await validateVideoFile(video);
      // console.log("Video validation:", result);

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

      console.log("Initializing Video converter...");
      const converter = new VideoConverter();
      await converter.initialize(setVideoConversionProgress);

      console.log("Starting video conversion...");
      const convertedData = await converter.convertVideo(
        video,
        {
          audioBitrate: 128000,
          audioSampleRate: 48000,
          crf: 23,
          duration: videoDuration,
          maxFileSizeMB: 20,
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

      // converter.downloadFile(convertedVideo);

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

      console.log("Initializing HLS converter...");
      const hlsConverter = new HLSConverter();
      await hlsConverter.initialize(setHLSConversionProgress);

      // Convert to HLS (try copy first, fallback to encoding if needed)
      console.log("Converting video to HLS format...");
      const hlsFiles = await hlsConverter.convertToHLS(video);
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
      if (blueskyIsEnabled) {
        setVideoTrimStatus("Trimming bluesky video if needed...");
        videos.bluesky = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "bluesky",
                maxDuration: BLUESKY_VIDEO_MAX_DURATION,
                maxFilesize: BLUESKY_VIDEO_MAX_FILESIZE,
                minDuration: BLUESKY_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (facebookIsEnabled) {
        setVideoTrimStatus("Trimming facebook video if needed...");
        videos.facebook = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "facebook",
                maxDuration: FACEBOOK_VIDEO_MAX_DURATION,
                maxFilesize: FACEBOOK_VIDEO_MAX_FILESIZE,
                minDuration: FACEBOOK_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (instagramIsEnabled) {
        setVideoTrimStatus("Trimming instagram video if needed...");
        videos.instagram = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "instagram",
                maxDuration: INSTAGRAM_VIDEO_MAX_DURATION,
                maxFilesize: INSTAGRAM_VIDEO_MAX_FILESIZE,
                minDuration: INSTAGRAM_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (neynarIsEnabled) {
        setVideoTrimStatus("Trimming farcaster video if needed...");
        videos.neynar = {
          // video: DEBUG_MEDIA
          //   ? videos.full.video
          //   : await trimVideo({
          //       label: "neynar",
          //       maxDuration: NEYNAR_VIDEO_MAX_DURATION,
          //       maxFilesize: NEYNAR_VIDEO_MAX_FILESIZE,
          //       minDuration: NEYNAR_VIDEO_MIN_DURATION,
          //       onProgress: setVideoTrimProgress,
          //       video: videos.full.video,
          //     }),
          video: null,
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (threadsIsEnabled) {
        setVideoTrimStatus("Trimming threads video if needed...");
        videos.threads = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "threads",
                maxDuration: THREADS_VIDEO_MAX_DURATION,
                maxFilesize: THREADS_VIDEO_MAX_FILESIZE,
                minDuration: THREADS_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (tiktokIsEnabled) {
        setVideoTrimStatus("Trimming tiktok video if needed...");
        videos.tiktok = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "tiktok",
                maxDuration: TIKTOK_VIDEO_MAX_DURATION,
                maxFilesize: TIKTOK_VIDEO_MAX_FILESIZE,
                minDuration: TIKTOK_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (twitterIsEnabled) {
        setVideoTrimStatus("Trimming twitter video if needed...");
        videos.twitter = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "twitter",
                maxDuration: TWITTER_VIDEO_MAX_DURATION,
                maxFilesize: TWITTER_VIDEO_MAX_FILESIZE,
                minDuration: TWITTER_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      if (youtubeIsEnabled) {
        setVideoTrimStatus("Trimming youtube video if needed...");
        videos.youtube = {
          video: DEBUG_MEDIA
            ? videos.full.video
            : await trimVideo({
                label: "youtube",
                maxDuration: YOUTUBE_VIDEO_MAX_DURATION,
                maxFilesize: YOUTUBE_VIDEO_MAX_FILESIZE,
                minDuration: YOUTUBE_VIDEO_MIN_DURATION,
                onProgress: setVideoTrimProgress,
                video: videos.full.video,
              }),
          videoHSLUrl: "",
          videoUrl: "",
        };
      }
      /* eslint-enable require-atomic-updates */

      cleanupFFmpegTrim();

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
    const needsHls = neynarIsEnabled;
    const needsS3 = tiktokIsEnabled;

    if (!pinataIsUsable && !amazonS3IsUsable) {
      throw new Error("You must enable a storage provider.");
    }

    if (needsS3 && !amazonS3IsUsable && tiktokIsUsable) {
      throw new Error(
        "To use TikTok at least one non-ipfs storage provider must be enabled. (Amazon S3).",
      );
    }

    if (needsHls && !pinataIsUsable) {
      throw new Error(
        "To use Farcaster or Lens at least one enabled storage provider must support IPFS or Arweave. (Pinata).",
      );
    }

    if (!pinataIsUsable && !amazonS3IsUsable) {
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
        const s3VideoResult = await amazonS3StoreVideo(
          videoData.video,
          videoId,
        );
        if (s3VideoResult) {
          videoUrl = s3VideoResult;
        }

        // eslint-disable-next-line no-await-in-loop
        const pinataVideoResult = await pinataStoreVideo(
          videoData.video,
          videoId,
        );
        if (pinataVideoResult) {
          videoUrl = pinataVideoResult;
        }

        // TikTok can't work with IPFS as the domain cannot be verified.
        if (videoId === "tiktok") {
          videoUrl = s3VideoResult;
        }

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
      const videoHSLUrl = await pinataStoreHLSFolder(
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
    text,
    title,
    videos,
  }: Readonly<CreatePostProps>): Promise<void> {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unnecessary-condition */
    const allResults = await Promise.allSettled([
      blueskyPost({
        text,
        title,
        userId: blueskyAccounts[0]?.id,
        username: blueskyAccounts[0]?.username,
        video: videos.bluesky?.video || videos.full.video,
        videoHSLUrl: videos.bluesky?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.bluesky?.videoUrl || videos.full.videoUrl,
      }),
      facebookPost({
        text,
        title,
        userId: facebookAccounts[0]?.id,
        username: facebookAccounts[0]?.username,
        video: videos.facebook?.video || videos.full.video,
        videoHSLUrl: videos.facebook?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.facebook?.videoUrl || videos.full.videoUrl,
      }),
      instagramPost({
        text,
        title,
        userId: instagramAccounts[0]?.id,
        username: instagramAccounts[0]?.username,
        video: videos.instagram?.video || videos.full.video,
        videoHSLUrl: videos.instagram?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.instagram?.videoUrl || videos.full.videoUrl,
      }),
      neynarPost({
        text,
        title,
        userId: neynarAccounts[0]?.id,
        username: neynarAccounts[0]?.username,
        video: videos.neynar?.video || videos.full.video,
        videoHSLUrl: videos.neynar?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.neynar?.videoUrl || videos.full.videoUrl,
      }),
      threadsPost({
        text,
        title,
        userId: threadsAccounts[0]?.id,
        username: threadsAccounts[0]?.username,
        video: videos.threads?.video || videos.full.video,
        videoHSLUrl: videos.threads?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.threads?.videoUrl || videos.full.videoUrl,
      }),
      tiktokPost({
        text,
        title,
        userId: tiktokAccounts[0]?.id,
        username: tiktokAccounts[0]?.username,
        video: videos.tiktok?.video || videos.full.video,
        videoHSLUrl: videos.tiktok?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.tiktok?.videoUrl || videos.full.videoUrl,
      }),
      twitterPost({
        text,
        title,
        userId: twitterAccounts[0]?.id,
        username: twitterAccounts[0]?.username,
        video: videos.twitter?.video || videos.full.video,
        videoHSLUrl: videos.twitter?.videoHSLUrl || videos.full.videoHSLUrl,
        videoUrl: videos.twitter?.videoUrl || videos.full.videoUrl,
      }),
      youtubePost({
        text,
        title,
        userId: youtubeAccounts[0]?.id,
        username: youtubeAccounts[0]?.username,
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
