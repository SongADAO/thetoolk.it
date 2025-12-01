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
import { POST_CONTEXTS } from "@/services/post/contexts";
import { STORAGE_CONTEXTS } from "@/services/storage/contexts";

interface Props {
  children: ReactNode;
}

export function CreatePostProvider({ children }: Readonly<Props>) {
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

  // Post services
  // ---------------------------------------------------------------------------
  const postPlatforms = Object.fromEntries(
    POST_CONTEXTS.map(({ context, id }) => [id, use(context)]),
  );

  const postPlatformsArray = Object.values(postPlatforms);

  const isPosting = postPlatformsArray.some(
    (platform) => platform.isProcessing,
  );

  const unauthorizedPostServices = postPlatformsArray.filter(
    (platform) => platform.isEnabled && !platform.isUsable,
  );

  const hasUnauthorizedPostServices = unauthorizedPostServices.length > 0;

  function resetPostState(): void {
    postPlatformsArray.forEach((platform) => platform.resetProcessState());
  }

  // Storage services
  // ---------------------------------------------------------------------------
  const storagePlatforms = Object.fromEntries(
    STORAGE_CONTEXTS.map(({ context, id }) => [id, use(context)]),
  );

  const storagePlatformsArray = Object.values(storagePlatforms);

  const isStoring = storagePlatformsArray.some(
    (platform) => platform.isProcessing,
  );

  const unauthorizedStorageServices = storagePlatformsArray.filter(
    (platform) => platform.isEnabled && !platform.isUsable,
  );

  const hasUnauthorizeStorageServices = unauthorizedStorageServices.length > 0;

  const hasStoragePlatform = storagePlatformsArray.some(
    (platform) => platform.isEnabled && platform.isUsable,
  );

  function resetStoreState(): void {
    storagePlatformsArray.forEach((platform) => platform.resetProcessState());
  }

  // Service Requirements
  // ---------------------------------------------------------------------------

  const needsHls = postPlatforms.neynar.isEnabled;

  // const needsS3 = tiktok.isEnabled;
  const needsS3: true | false = false;

  // Post Logic.
  // ---------------------------------------------------------------------------

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
    if (!hasStoragePlatform) {
      throw new Error("You must enable a storage provider.");
    }

    if (needsS3 && !storagePlatforms.amazons3.isUsable) {
      throw new Error(
        "To use TikTok at least one non-ipfs storage provider must be enabled. (Amazon S3).",
      );
    }

    if (needsHls && !storagePlatforms.pinata.isUsable) {
      throw new Error(
        "To use Farcaster or Lens at least one enabled storage provider must support IPFS or Arweave. (Pinata).",
      );
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
      platforms: postPlatformsArray,
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
        const s3VideoResult = await storagePlatforms.amazons3.storeVideo(
          videoData.video,
          videoId,
        );

        // eslint-disable-next-line no-await-in-loop
        const pinataVideoResult = await storagePlatforms.pinata.storeVideo(
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
      const videoHSLUrl = await storagePlatforms.pinata.storeHLSFolder(
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
    const allResults = await Promise.allSettled(
      postPlatformsArray.map(async (platform) =>
        platformCreatePost({
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
        }),
      ),
    );

    console.log("All results:", allResults);
  }

  const providerValues = useMemo(
    () => ({
      createPost,
      getVideoInfo,
      hasUnauthorizedPostServices,
      hasUnauthorizeStorageServices,
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
      unauthorizedPostServices,
      unauthorizedStorageServices,
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
      hasUnauthorizedPostServices,
      hasUnauthorizeStorageServices,
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
      unauthorizedPostServices,
      unauthorizedStorageServices,
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
