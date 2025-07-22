"use client";

import { ReactNode, use, useMemo, useState } from "react";

import {
  DEBUG_MEDIA,
  DEBUG_STOP_AFTER_CONVERSION,
  DEBUG_STOP_AFTER_STORAGE,
} from "@/app/config/constants";
import { HLSConverter, type HLSFiles } from "@/app/lib/hls-converter";
import { sleep } from "@/app/lib/utils";
import {
  // getVideoCodecInfo,
  getVideoDuration,
} from "@/app/lib/video";
// import { VideoConverter } from "@/app/lib/video-converter-ffmpeg";
import { VideoConverter } from "@/app/lib/video-converter-webcodecs";
import { trimVideo } from "@/app/lib/video-trimmer";
// import { validateVideoFile } from "@/app/lib/video-validator";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { InstagramContext } from "@/app/services/post/instagram/Context";
import { NeynarContext } from "@/app/services/post/neynar/Context";
import { ThreadsContext } from "@/app/services/post/threads/Context";
import { TiktokContext } from "@/app/services/post/tiktok/Context";
import { TwitterContext } from "@/app/services/post/twitter/Context";
import { YoutubeContext } from "@/app/services/post/youtube/Context";
import {
  type CreatePostProps,
  PostContext,
  type PostVideo,
} from "@/app/services/PostContext";
import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";
import { PinataContext } from "@/app/services/storage/pinata/Context";

interface Props {
  children: ReactNode;
}

export function PostProvider({ children }: Readonly<Props>) {
  const {
    isEnabled: blueskyIsEnabled,
    isUsable: blueskyIsUsable,
    accounts: blueskyAccounts,
    post: blueskyPost,
    VIDEO_MAX_DURATION: BLUESKY_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: BLUESKY_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: BLUESKY_VIDEO_MIN_DURATION,
  } = use(BlueskyContext);
  const {
    isEnabled: facebookIsEnabled,
    isUsable: facebookIsUsable,
    accounts: facebookAccounts,
    post: facebookPost,
    VIDEO_MAX_DURATION: FACEBOOK_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: FACEBOOK_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: FACEBOOK_VIDEO_MIN_DURATION,
  } = use(FacebookContext);
  const {
    isEnabled: instagramIsEnabled,
    isUsable: instagramIsUsable,
    accounts: instagramAccounts,
    post: instagramPost,
    VIDEO_MAX_DURATION: INSTAGRAM_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: INSTAGRAM_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: INSTAGRAM_VIDEO_MIN_DURATION,
  } = use(InstagramContext);
  const {
    isUsable: neynarIsUsable,
    isEnabled: neynarIsEnabled,
    accounts: neynarAccounts,
    post: neynarPost,
    VIDEO_MAX_DURATION: NEYNAR_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: NEYNAR_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: NEYNAR_VIDEO_MIN_DURATION,
  } = use(NeynarContext);
  const {
    isEnabled: threadsIsEnabled,
    isUsable: threadsIsUsable,
    accounts: threadsAccounts,
    post: threadsPost,
    VIDEO_MAX_DURATION: THREADS_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: THREADS_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: THREADS_VIDEO_MIN_DURATION,
  } = use(ThreadsContext);
  const {
    isEnabled: tiktokIsEnabled,
    isUsable: tiktokIsUsable,
    accounts: tiktokAccounts,
    post: tiktokPost,
    VIDEO_MAX_DURATION: TIKTOK_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: TIKTOK_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: TIKTOK_VIDEO_MIN_DURATION,
  } = use(TiktokContext);
  const {
    isEnabled: twitterIsEnabled,
    isUsable: twitterIsUsable,
    accounts: twitterAccounts,
    post: twitterPost,
    VIDEO_MAX_DURATION: TWITTER_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: TWITTER_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: TWITTER_VIDEO_MIN_DURATION,
  } = use(TwitterContext);
  const {
    isEnabled: youtubeIsEnabled,
    isUsable: youtubeIsUsable,
    accounts: youtubeAccounts,
    post: youtubePost,
    VIDEO_MAX_DURATION: YOUTUBE_VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE: YOUTUBE_VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION: YOUTUBE_VIDEO_MIN_DURATION,
  } = use(YoutubeContext);

  const {
    isEnabled: pinataIsEnabled,
    isUsable: pinataIsUsable,
    storeVideo: pinataStoreVideo,
    storeHLSFolder: pinataStoreHLSFolder,
  } = use(PinataContext);
  const {
    isEnabled: amazonS3IsEnabled,
    isUsable: amazonS3IsUsable,
    storeVideo: amazonS3StoreVideo,
  } = use(AmazonS3Context);

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [videoFileSize, setVideoFileSize] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCodecInfo, setVideoCodecInfo] = useState<string>("");

  const [videoConversionProgress, setVideoConversionProgress] = useState(0);
  const [videoConversionError, setVideoConversionError] = useState("");
  const [isVideoConverting, setIsVideoConverting] = useState(false);

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
      if (DEBUG_MEDIA) {
        console.log("DEBUG MODE: Skipping video conversion.");
        setIsVideoConverting(true);
        setVideoConversionProgress(0);
        await sleep(1000);
        setVideoConversionProgress(20);
        await sleep(1000);
        setVideoConversionProgress(40);
        await sleep(1000);
        setVideoConversionProgress(60);
        await sleep(1000);
        setVideoConversionProgress(80);
        await sleep(1000);
        setVideoConversionProgress(100);

        return video;
      }

      setIsVideoConverting(true);
      setVideoConversionProgress(0);

      console.log("Initializing Video converter...");
      const converter = new VideoConverter();
      await converter.initialize();

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
      );

      // Convert Uint8Array back to File object
      const convertedVideo = new File(
        [convertedData],
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
    } catch (error) {
      console.error("Video conversion failed:", error);
      setVideoConversionError("Failed to convert video.");
      throw error;
    } finally {
      setIsVideoConverting(false);
      setVideoConversionProgress(0);
    }
  }

  async function convertHLSVideo(video: File): Promise<HLSFiles> {
    try {
      if (DEBUG_MEDIA) {
        console.log("DEBUG MODE: Skipping HLS conversion.");
        setIsHLSConverting(true);
        setHLSConversionProgress(0);
        await sleep(1000);
        setHLSConversionProgress(20);
        await sleep(1000);
        setHLSConversionProgress(40);
        await sleep(1000);
        setHLSConversionProgress(60);
        await sleep(1000);
        setHLSConversionProgress(80);
        await sleep(1000);
        setHLSConversionProgress(100);

        return {
          masterManifest: video,
          segments: [],
          streamManifest: video,
          thumbnail: video,
        };
      }

      setIsHLSConverting(true);
      setHLSConversionProgress(0);

      console.log("Initializing HLS converter...");
      const hlsConverter = new HLSConverter();
      await hlsConverter.initialize(setHLSConversionProgress);

      // Convert to HLS (try copy first, fallback to encoding if needed)
      console.log("Converting video to HLS format...");
      const hlsFiles = await hlsConverter.convertToHLS(video);
      console.log(hlsFiles);

      console.log("HLS conversion successful");

      return hlsFiles;
    } catch (error) {
      console.error("HLS conversion/upload failed:", error);
      setHLSConversionError("Failed to convert video to HLS format.");
      throw error;
    } finally {
      setIsHLSConverting(false);
      setHLSConversionProgress(0);
    }
  }

  async function preparePostVideo(
    selectedFile: File,
  ): Promise<Record<string, PostVideo>> {
    const needsHls = neynarIsEnabled;

    if (!pinataIsUsable && !amazonS3IsUsable) {
      throw new Error("You must enable a storage provider.");
    }

    if (needsHls && !pinataIsUsable) {
      throw new Error(
        "To use Farcaster or Lens at least one enabled storage provider must support IPFS or Arweave. (Pinata).",
      );
    }

    if (!pinataIsUsable && !amazonS3IsUsable) {
      throw new Error("You must enable a storage provider.");
    }

    const videos: Record<string, PostVideo> = {
      base: {
        video: null,
        videoHSLUrl: "",
        videoUrl: "",
      },
    };

    // Convert video if file is selected.
    // -------------------------------------------------------------------------
    console.log("Converting video to H264/AAC before upload...");
    // videos.base.video = await convertVideo(selectedFile);
    videos.base.video = selectedFile;
    // -------------------------------------------------------------------------

    // Make HLS Streamable video
    // -------------------------------------------------------------------------
    let hlsFiles: HLSFiles | null = null;
    if (needsHls) {
      console.log("Converting HLS video before upload...");
      hlsFiles = await convertHLSVideo(videos.base.video);
    }
    // -------------------------------------------------------------------------

    if (blueskyIsEnabled) {
      videos.bluesky = {
        video: await trimVideo({
          maxDuration: BLUESKY_VIDEO_MAX_DURATION,
          maxFilesize: BLUESKY_VIDEO_MAX_FILESIZE,
          minDuration: BLUESKY_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (facebookIsEnabled) {
      videos.facebook = {
        video: await trimVideo({
          maxDuration: FACEBOOK_VIDEO_MAX_DURATION,
          maxFilesize: FACEBOOK_VIDEO_MAX_FILESIZE,
          minDuration: FACEBOOK_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (instagramIsEnabled) {
      videos.instagram = {
        video: await trimVideo({
          maxDuration: INSTAGRAM_VIDEO_MAX_DURATION,
          maxFilesize: INSTAGRAM_VIDEO_MAX_FILESIZE,
          minDuration: INSTAGRAM_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (neynarIsEnabled) {
      videos.neynar = {
        // video: await trimVideo({
        //   maxDuration: NEYNAR_VIDEO_MAX_DURATION,
        //   maxFilesize: NEYNAR_VIDEO_MAX_FILESIZE,
        //   minDuration: NEYNAR_VIDEO_MIN_DURATION,
        //   video: videos.base.video,
        // }),
        video: null,
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (threadsIsEnabled) {
      videos.threads = {
        video: await trimVideo({
          maxDuration: THREADS_VIDEO_MAX_DURATION,
          maxFilesize: THREADS_VIDEO_MAX_FILESIZE,
          minDuration: THREADS_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (tiktokIsEnabled) {
      videos.tiktok = {
        video: await trimVideo({
          maxDuration: TIKTOK_VIDEO_MAX_DURATION,
          maxFilesize: TIKTOK_VIDEO_MAX_FILESIZE,
          minDuration: TIKTOK_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (twitterIsEnabled) {
      videos.twitter = {
        video: await trimVideo({
          maxDuration: TWITTER_VIDEO_MAX_DURATION,
          maxFilesize: TWITTER_VIDEO_MAX_FILESIZE,
          minDuration: TWITTER_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }
    if (youtubeIsEnabled) {
      videos.youtube = {
        video: await trimVideo({
          maxDuration: YOUTUBE_VIDEO_MAX_DURATION,
          maxFilesize: YOUTUBE_VIDEO_MAX_FILESIZE,
          minDuration: YOUTUBE_VIDEO_MIN_DURATION,
          video: videos.base.video,
        }),
        videoHSLUrl: "",
        videoUrl: "",
      };
    }

    console.log(videos);

    // if (videos.bluesky.video) {
    //   const converter = new VideoConverter();
    //   converter.downloadFile(videos.bluesky.video);
    // }

    // -------------------------------------------------------------------------
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
        const s3VideoResult = await amazonS3StoreVideo(videoData.video);
        if (s3VideoResult) {
          videoUrl = s3VideoResult;
        }

        // eslint-disable-next-line no-await-in-loop
        const pinataVideoResult = await pinataStoreVideo(videoData.video);
        if (pinataVideoResult) {
          videoUrl = pinataVideoResult;
        }

        if (!videoUrl) {
          console.error("Failed to upload video to storage.");
          throw new Error("Failed to upload video to storage.");
        }

        videos[videoId].videoUrl = videoUrl;

        console.log("Video upload successful:", videoUrl);
      }
    }
    // -------------------------------------------------------------------------

    // Upload HLS Streamable video to storage.
    // -------------------------------------------------------------------------
    if (needsHls && hlsFiles) {
      // Upload HLS files to Pinata
      console.log("Uploading HLS files to Pinata...");
      videos.neynar.videoHSLUrl = await pinataStoreHLSFolder(
        hlsFiles,
        `hls-video-${Date.now()}`,
      );

      if (!videos.neynar.videoHSLUrl) {
        throw new Error("Failed to upload HLS files to Pinata");
      }

      console.log("HLS upload successful:", videos.neynar.videoHSLUrl);
    }
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    if (DEBUG_STOP_AFTER_STORAGE) {
      throw new Error("TESTING STORAGE ONLY");
    }
    // -------------------------------------------------------------------------

    return videos;
  }

  async function createPost({
    text,
    title,
    video,
    videoHSLUrl,
    videoUrl,
  }: Readonly<CreatePostProps>): Promise<void> {
    const allResults = await Promise.allSettled([
      blueskyPost({
        text,
        title,
        userId: blueskyAccounts[0]?.id,
        username: blueskyAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      facebookPost({
        text,
        title,
        userId: facebookAccounts[0]?.id,
        username: facebookAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      instagramPost({
        text,
        title,
        userId: instagramAccounts[0]?.id,
        username: instagramAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      neynarPost({
        text,
        title,
        userId: neynarAccounts[0]?.id,
        username: neynarAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      threadsPost({
        text,
        title,
        userId: threadsAccounts[0]?.id,
        username: threadsAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      tiktokPost({
        text,
        title,
        userId: tiktokAccounts[0]?.id,
        username: tiktokAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      twitterPost({
        text,
        title,
        userId: twitterAccounts[0]?.id,
        username: twitterAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
      youtubePost({
        text,
        title,
        userId: youtubeAccounts[0]?.id,
        username: youtubeAccounts[0]?.username,
        video,
        videoHSLUrl,
        videoUrl,
      }),
    ]);

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
      isHLSConverting,
      isVideoConverting,
      preparePostVideo,
      videoCodecInfo,
      videoConversionError,
      videoConversionProgress,
      videoDuration,
      videoFileSize,
      videoPreviewUrl,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canPostToAllServices,
      canStoreToAllServices,
      hlsConversionError,
      hlsConversionProgress,
      isHLSConverting,
      isVideoConverting,
      preparePostVideo,
      videoCodecInfo,
      videoConversionError,
      videoConversionProgress,
      videoDuration,
      videoFileSize,
      videoPreviewUrl,
    ],
  );

  return (
    <PostContext.Provider value={providerValues}>
      {children}
    </PostContext.Provider>
  );
}
