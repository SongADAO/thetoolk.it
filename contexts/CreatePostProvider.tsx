"use client";

import { ReactNode, use, useMemo, useState } from "react";

import {
  DEBUG_STOP_AFTER_CONVERSION,
  DEBUG_STOP_AFTER_STORAGE,
} from "@/config/constants";
import {
  type CreatePlatformPostProps,
  CreatePostContext,
  type CreatePostProps,
  type PostVideo,
} from "@/contexts/CreatePostContext";
import { convertHLSVideo, convertVideo, trimPlatformVideos } from "@/lib/post";
import type { HLSFiles } from "@/lib/video/hls";
import { getVideoDuration } from "@/lib/video/video";
import { BlueskyContext } from "@/services/post/bluesky/Context";
import { FacebookContext } from "@/services/post/facebook/Context";
import { InstagramContext } from "@/services/post/instagram/Context";
import { NeynarContext } from "@/services/post/neynar/Context";
import { ThreadsContext } from "@/services/post/threads/Context";
import { TiktokContext } from "@/services/post/tiktok/Context";
import { TwitterContext } from "@/services/post/twitter/Context";
import { YoutubeContext } from "@/services/post/youtube/Context";
import { AmazonS3Context } from "@/services/storage/amazons3/Context";
import { PinataContext } from "@/services/storage/pinata/Context";

interface Props {
  children: ReactNode;
}

export function CreatePostProvider({ children }: Readonly<Props>) {
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
    bluesky.resetProcessState();
    facebook.resetProcessState();
    instagram.resetProcessState();
    neynar.resetProcessState();
    threads.resetProcessState();
    tiktok.resetProcessState();
    twitter.resetProcessState();
    youtube.resetProcessState();
  }

  function resetStoreState(): void {
    pinata.resetProcessState();
    amazonS3.resetProcessState();
  }

  const isStoring = pinata.isProcessing || amazonS3.isProcessing;

  const isPosting =
    bluesky.isProcessing ||
    facebook.isProcessing ||
    instagram.isProcessing ||
    neynar.isProcessing ||
    threads.isProcessing ||
    tiktok.isProcessing ||
    twitter.isProcessing ||
    youtube.isProcessing;

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
    setVideoPreviewUrl("");
    setVideoFileSize(0);
    setVideoDuration(0);
    setVideoCodecInfo("");

    if (video) {
      setVideoPreviewUrl(URL.createObjectURL(video));
      setVideoFileSize(video.size);
      setVideoDuration(await getVideoDuration(video));
    }
  }

  async function preparePostVideo(
    video: File,
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

    // Convert video if file is selected.
    // -------------------------------------------------------------------------
    console.log("Converting video to H264/AAC before upload...");
    const fullConvertedVideo = await convertVideo({
      setIsProcessing: setIsVideoConverting,
      setProcessError: setVideoConversionError,
      setProcessProgress: setVideoConversionProgress,
      setProcessStatus: setVideoConversionStatus,
      video,
    });
    // const fullConvertedVideo = video;
    // -------------------------------------------------------------------------

    // Make HLS Streamable video
    // -------------------------------------------------------------------------
    console.log("Converting HLS video before upload...");
    const hlsFiles: HLSFiles | null = needsHls
      ? await convertHLSVideo({
          setIsProcessing: setIsHLSConverting,
          setProcessError: setHLSConversionError,
          setProcessProgress: setHLSConversionProgress,
          setProcessStatus: setHLSConversionStatus,
          video: fullConvertedVideo,
        })
      : null;
    // -------------------------------------------------------------------------

    // Trim platform specific videos
    // -------------------------------------------------------------------------
    console.log("Converting HLS video before upload...");
    const videos = await trimPlatformVideos({
      platforms: [
        bluesky,
        facebook,
        instagram,
        neynar,
        threads,
        tiktok,
        twitter,
        youtube,
      ],
      setIsProcessing: setIsVideoTrimming,
      setProcessError: setVideoTrimError,
      setProcessProgress: setVideoTrimProgress,
      setProcessStatus: setVideoTrimStatus,
      video: fullConvertedVideo,
    });
    console.log(videos);
    // -------------------------------------------------------------------------

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
        // eslint-disable-next-line no-await-in-loop
        const s3VideoResult = await amazonS3.storeVideo(
          videoData.video,
          videoId,
        );

        // eslint-disable-next-line no-await-in-loop
        const pinataVideoResult = await pinata.storeVideo(
          videoData.video,
          videoId,
        );

        let videoUrl = "";
        if (pinataVideoResult) {
          videoUrl = pinataVideoResult;
        } else if (s3VideoResult) {
          videoUrl = s3VideoResult;
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

  async function platformCreatePost({
    facebookPrivacy,
    platform,
    text,
    tiktokComment,
    tiktokDisclose,
    tiktokDiscloseBrandOther,
    tiktokDiscloseBrandSelf,
    tiktokDuet,
    tiktokPrivacy,
    tiktokStitch,
    title,
    videos,
    youtubePrivacy,
  }: Readonly<CreatePlatformPostProps>): Promise<string | null> {
    const params = {
      options: {},
      privacy: "",
      text,
      title,
      userId: platform.accounts[0]?.id,
      username: platform.accounts[0]?.username,
      video: videos[platform.id].video ?? videos.full.video,
      videoHSLUrl: videos[platform.id].videoHSLUrl ?? videos.full.videoHSLUrl,
      videoUrl: videos[platform.id].videoUrl ?? videos.full.videoUrl,
    };

    if (platform.id === "tiktok") {
      params.options = {
        disclose: tiktokDisclose,
        discloseBrandOther: tiktokDiscloseBrandOther,
        discloseBrandSelf: tiktokDiscloseBrandSelf,
        permissionComment: tiktokComment,
        permissionDuet: tiktokDuet,
        permissionStitch: tiktokStitch,
      };
      params.privacy = tiktokPrivacy;
    }

    if (platform.id === "youtube") {
      params.privacy = youtubePrivacy;
    }

    if (platform.id === "facebook") {
      params.privacy = facebookPrivacy;
    }

    return platform.post(params);
  }

  async function createPost({
    facebookPrivacy,
    text,
    tiktokComment,
    tiktokDisclose,
    tiktokDiscloseBrandOther,
    tiktokDiscloseBrandSelf,
    tiktokDuet,
    tiktokPrivacy,
    tiktokStitch,
    title,
    videos,
    youtubePrivacy,
  }: Readonly<CreatePostProps>): Promise<void> {
    const props = {
      facebookPrivacy,
      text,
      tiktokComment,
      tiktokDisclose,
      tiktokDiscloseBrandOther,
      tiktokDiscloseBrandSelf,
      tiktokDuet,
      tiktokPrivacy,
      tiktokStitch,
      title,
      videos,
      youtubePrivacy,
    };

    const allResults = await Promise.allSettled([
      platformCreatePost({
        ...props,
        platform: bluesky,
      }),
      platformCreatePost({
        ...props,
        platform: facebook,
      }),
      platformCreatePost({
        ...props,
        platform: instagram,
      }),
      platformCreatePost({
        ...props,
        platform: neynar,
      }),
      platformCreatePost({
        ...props,
        platform: threads,
      }),
      platformCreatePost({
        ...props,
        platform: tiktok,
      }),
      platformCreatePost({
        ...props,
        platform: twitter,
      }),
      platformCreatePost({
        ...props,
        platform: youtube,
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
    <CreatePostContext.Provider value={providerValues}>
      {children}
    </CreatePostContext.Provider>
  );
}
