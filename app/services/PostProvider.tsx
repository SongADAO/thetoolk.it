"use client";

import { ReactNode, use, useMemo, useState } from "react";

import { DEBUG_MEDIA } from "@/app/config/constants";
import { HLSConverter, type HLSFiles } from "@/app/lib/hls-converter";
import { sleep } from "@/app/lib/utils";
import {
  // getVideoCodecInfo,
  getVideoDuration,
} from "@/app/lib/video";
// import { VideoConverter } from "@/app/lib/video-converter-ffmpeg";
import { VideoConverter } from "@/app/lib/video-converter-webcodecs";
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
  const { accounts: blueskyAccounts, post: blueskyPost } = use(BlueskyContext);
  const { accounts: facebookAccounts, post: facebookPost } =
    use(FacebookContext);
  const { accounts: instagramAccounts, post: instagramPost } =
    use(InstagramContext);
  const {
    isEnabled: neynarIsEnabled,
    accounts: neynarAccounts,
    post: neynarPost,
  } = use(NeynarContext);
  const { accounts: threadsAccounts, post: threadsPost } = use(ThreadsContext);
  const { accounts: tiktokAccounts, post: tiktokPost } = use(TiktokContext);
  const { accounts: twitterAccounts, post: twitterPost } = use(TwitterContext);
  const { accounts: youtubeAccounts, post: youtubePost } = use(YoutubeContext);

  const {
    isUsable: pinataIsUsable,
    storeVideo: pinataStoreVideo,
    storeHLSFolder: pinataStoreHLSFolder,
  } = use(PinataContext);
  const { isUsable: amazonS3IsUsable, storeVideo: amazonS3StoreVideo } =
    use(AmazonS3Context);

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
      setVideoConversionProgress(20);

      console.log("Starting video conversion...");
      const convertedData = await converter.convertVideo(video, {
        audioBitrate: 128000,
        audioSampleRate: 48000,
        crf: 23,
        duration: videoDuration,
        maxFileSizeMB: 20,
        maxWidth: 1920,
        targetFps: 30,
      });
      setVideoConversionProgress(80);

      // Convert Uint8Array back to File object
      const convertedVideo = new File(
        [convertedData],
        `converted_${video.name}`,
        { type: "video/mp4" },
      );

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
      await hlsConverter.initialize();
      setHLSConversionProgress(20);

      // Convert to HLS (try copy first, fallback to encoding if needed)
      console.log("Converting video to HLS format...");
      const hlsFiles = await hlsConverter.convertToHLS(video);
      setHLSConversionProgress(80);

      console.log("HLS conversion successful");
      setHLSConversionProgress(100);

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

  async function preparePostVideo(selectedFile: File): Promise<PostVideo> {
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

    // Convert video if file is selected.
    // -------------------------------------------------------------------------
    console.log("Converting video to H264/AAC before upload...");
    const video = await convertVideo(selectedFile);
    // -------------------------------------------------------------------------

    // Make HLS Streamable video
    // -------------------------------------------------------------------------
    console.log("Converting HLS video before upload...");
    const hlsFiles = await convertHLSVideo(video);
    // -------------------------------------------------------------------------

    // Upload video to storage.
    // -------------------------------------------------------------------------
    console.log("Uploading video to remote storage...");

    let videoUrl = "";

    const s3VideoResult = await amazonS3StoreVideo(video);
    if (s3VideoResult) {
      videoUrl = s3VideoResult;
    }

    const pinataVideoResult = await pinataStoreVideo(video);
    if (pinataVideoResult) {
      videoUrl = pinataVideoResult;
    }

    if (!videoUrl) {
      console.error("Failed to upload video to storage.");
      throw new Error("Failed to upload video to storage.");
    }

    console.log("Video upload successful:", videoUrl);
    // -------------------------------------------------------------------------

    // Upload HLS Streamable video to storage.
    // -------------------------------------------------------------------------
    // Upload HLS files to Pinata
    console.log("Uploading HLS files to Pinata...");
    const videoHSLUrl = await pinataStoreHLSFolder(
      hlsFiles,
      `hls-video-${Date.now()}`,
    );

    if (!videoHSLUrl) {
      throw new Error("Failed to upload HLS files to Pinata");
    }

    console.log("HLS upload successful:", videoHSLUrl);
    // -------------------------------------------------------------------------

    return {
      video,
      videoHSLUrl,
      videoUrl,
    };
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
