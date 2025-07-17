"use client";
import { Form } from "radix-ui";
import { use, useActionState, useRef, useState } from "react";

import { Spinner } from "@/app/components/Spinner";
import { DEBUG_MODE } from "@/app/config/constants";
import {
  HLSConverter,
  type HLSFiles,
  type HLSUploadResult,
} from "@/app/lib/hls-converter";
import {
  formatFileDuration,
  formatFileSize,
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
import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";
import { PinataContext } from "@/app/services/storage/pinata/Context";

interface FormState {
  text: string;
  title: string;
}

function fromInitial(): FormState {
  return {
    text: "This is a test.",
    title: "Test Title",
  };
}

function fromFormData(formData: FormData): FormState {
  return {
    text: String(formData.get("text")),
    title: String(formData.get("title")),
  };
}

function PostForm() {
  const { accounts: blueskyAccounts, post: blueskyPost } = use(BlueskyContext);
  const { accounts: facebookAccounts, post: facebookPost } =
    use(FacebookContext);
  const { accounts: instagramAccounts, post: instagramPost } =
    use(InstagramContext);
  const { accounts: neynarAccounts, post: neynarPost } = use(NeynarContext);
  const { accounts: threadsAccounts, post: threadsPost } = use(ThreadsContext);
  const { accounts: tiktokAccounts, post: tiktokPost } = use(TiktokContext);
  const { accounts: twitterAccounts, post: twitterPost } = use(TwitterContext);
  const { accounts: youtubeAccounts, post: youtubePost } = use(YoutubeContext);

  const {
    // storeJson: pinataStoreJson,
    storeFile: pinataStoreFile,
    storeVideo: pinataStoreVideo,
    storeHLSFolder: pinataStoreHLSFolder,
  } = use(PinataContext);
  const {
    // storeJson: amazonS3StoreJson,
    storeFile: amazonS3StoreFile,
    storeVideo: amazonS3StoreVideo,
  } = use(AmazonS3Context);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [videoFileSize, setVideoFileSize] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCodecInfo, setVideoCodecInfo] = useState<string>("");

  // Video conversion state
  const [videoConverter, setVideoConverter] = useState<VideoConverter | null>(
    null,
  );
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionError, setConversionError] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const [hlsConversionProgress, setHlsConversionProgress] = useState(0);
  const [hlsConversionError, setHlsConversionError] = useState("");
  const [isHLSConverting, setIsHLSConverting] = useState(false);

  const [storageError, setStorageError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (file) {
      setVideoPreviewUrl(URL.createObjectURL(file));
      setVideoFileSize(file.size);
      getVideoDuration({ file, setVideoDuration });
      // setVideoCodecInfo(await getVideoCodecInfo(file));

      // console.log("check video info");
      // const result = await validateVideoFile(file);
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
      setIsConverting(true);
      setConversionProgress(0);

      console.log("Initializing Video converter...");
      const converter = new VideoConverter();
      await converter.initialize();
      setConversionProgress(20);

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
      setHlsConversionProgress(80);

      // Convert Uint8Array back to File object
      const convertedVideo = new File(
        [convertedData],
        `converted_${video.name}`,
        { type: "video/mp4" },
      );

      console.log(
        `Conversion complete! Original: ${(video.size / 1024 / 1024).toFixed(2)}MB -> Converted: ${(convertedVideo.size / 1024 / 1024).toFixed(2)}MB`,
      );
      setHlsConversionProgress(100);

      // converter.downloadFile(convertedVideo);

      return convertedVideo;
    } catch (error) {
      console.error("Video conversion failed:", error);
      setConversionError("Failed to convert video.");
      throw error;
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  }

  async function convertHLSVideo(video: File): Promise<HLSFiles> {
    try {
      setIsHLSConverting(true);
      setHlsConversionProgress(0);

      console.log("Initializing HLS converter...");
      const hlsConverter = new HLSConverter();
      await hlsConverter.initialize();
      setHlsConversionProgress(20);

      // Convert to HLS (try copy first, fallback to encoding if needed)
      console.log("Converting video to HLS format...");
      const hlsFiles = await hlsConverter.convertToHLS(video);
      setHlsConversionProgress(80);

      console.log("HLS conversion successful");
      setHlsConversionProgress(100);

      return hlsFiles;
    } catch (error) {
      console.error("HLS conversion/upload failed:", error);
      setHlsConversionError("Failed to convert video to HLS format.");
      throw error;
    } finally {
      setIsHLSConverting(false);
      setHlsConversionProgress(0);
    }
  }

  async function saveForm(previousState: FormState, formData: FormData) {
    const newFormState = fromFormData(formData);

    // console.log(previousState);
    // console.log(newFormState);
    // console.log(selectedFile);

    /* eslint-disable no-useless-assignment */
    let hlsFiles: HLSFiles | null = null;
    let hlsUploadResult: HLSUploadResult | null = null;
    let video: File | null = null;
    let videoUrl = "";
    let videoPlaylistUrl = "";
    let videoThumbnailUrl = "";
    /* eslint-enable no-useless-assignment */

    // video = selectedFile;
    // videoUrl =
    //   "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
    // videoPlaylistUrl = `https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8`;
    // videoThumbnailUrl =
    //   "https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/thumbnail.jpg";

    // Convert video if file is selected.
    // -------------------------------------------------------------------------
    if (selectedFile) {
      if (DEBUG_MODE) {
        video = selectedFile;
      } else {
        try {
          console.log("Converting video before upload...");
          video = await convertVideo(selectedFile);
        } catch (error) {
          return newFormState;
        }
      }
    }
    // -------------------------------------------------------------------------

    // Make HLS Streamable video
    // -------------------------------------------------------------------------
    if (selectedFile && video) {
      if (DEBUG_MODE) {
        hlsFiles = {
          masterManifest: selectedFile, // manifest.m3u8
          segments: [],
          streamManifest: selectedFile, // video.m3u8
          thumbnail: selectedFile,
        };
      } else {
        try {
          console.log("Converting HLS video before upload...");
          hlsFiles = await convertHLSVideo(video);
        } catch (error) {
          return newFormState;
        }
      }
    }
    // -------------------------------------------------------------------------

    // Upload video to storage.
    // -------------------------------------------------------------------------
    if (video) {
      const s3VideoResult = await amazonS3StoreVideo(video);
      if (s3VideoResult) {
        videoUrl = s3VideoResult;
      }

      const pinataVideoResult = await pinataStoreVideo(video);
      if (pinataVideoResult) {
        videoUrl = pinataVideoResult;
      }

      if (!videoUrl) {
        setStorageError("Failed to upload video to storage.");

        return newFormState;
      }
    }
    // -------------------------------------------------------------------------

    // Upload HLS Streamable video to storage.
    // -------------------------------------------------------------------------
    if (hlsFiles) {
      try {
        // Upload HLS files to Pinata
        console.log("Uploading HLS files to Pinata...");
        hlsUploadResult = await pinataStoreHLSFolder(
          hlsFiles,
          `hls-video-${Date.now()}`,
        );

        if (!hlsUploadResult?.playlistUrl || !hlsUploadResult.thumbnailUrl) {
          console.error("Failed to upload HLS files to Pinata");
          throw new Error("Failed to upload HLS files to Pinata");
        }

        console.log("HLS upload successful:", hlsUploadResult);
      } catch (error) {
        console.error("HLS upload failed:", error);
        setStorageError("Failed to upload HLS files to storage.");

        return newFormState;
      }

      videoPlaylistUrl = hlsUploadResult.playlistUrl;
      videoThumbnailUrl = hlsUploadResult.thumbnailUrl;
    }
    // -------------------------------------------------------------------------

    const allResults = await Promise.allSettled([
      blueskyPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: blueskyAccounts[0]?.id,
        username: blueskyAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      facebookPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: facebookAccounts[0]?.id,
        username: facebookAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      instagramPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: instagramAccounts[0]?.id,
        username: instagramAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      neynarPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: neynarAccounts[0]?.id,
        username: neynarAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      threadsPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: threadsAccounts[0]?.id,
        username: threadsAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      tiktokPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: tiktokAccounts[0]?.id,
        username: tiktokAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      twitterPost({
        text: newFormState.text,
        title: newFormState.title,
        userId: twitterAccounts[0]?.id,
        username: twitterAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
      youtubePost({
        text: newFormState.text,
        title: newFormState.title,
        userId: youtubeAccounts[0]?.id,
        username: youtubeAccounts[0]?.username,
        video,
        videoPlaylistUrl,
        videoThumbnailUrl,
        videoUrl,
      }),
    ]);

    console.log(allResults);

    return newFormState;
  }

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    saveForm,
    fromInitial(),
  );

  // Check if we should disable the form
  const isFormDisabled = isPending || isConverting;

  return (
    <div>
      <Form.Root>
        <Form.Field className="mb-4 flex flex-col" key="video" name="video">
          <Form.Label className="mb-2">Video</Form.Label>
          <Form.Control
            accept="video/mp4"
            autoComplete="off"
            className="w-full rounded border-1 bg-gray-500 p-2 text-white"
            disabled={isFormDisabled}
            onChange={handleFileChange}
            placeholder="Title"
            ref={fileInputRef}
            required
            title="Video"
            type="file"
          />
          <div>
            <Form.Message match="valueMissing">Missing video.</Form.Message>
          </div>
        </Form.Field>
      </Form.Root>

      {isConverting ? (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-yellow-800">
          <div className="flex items-center gap-2">
            <Spinner />
            Converting video for optimal quality and size...
          </div>
          {conversionProgress > 0 && (
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-yellow-200">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                />
              </div>
              <div className="mt-1 text-sm">{conversionProgress}% complete</div>
            </div>
          )}
        </div>
      ) : null}

      {videoPreviewUrl ? (
        <div className="mb-4 flex flex-col gap-2">
          <div>
            <video
              className="max-w-full rounded border border-gray-300"
              controls
              src={videoPreviewUrl}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div>Size: {formatFileSize(videoFileSize)}</div>
            <div>Duration: {formatFileDuration(videoDuration)}</div>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div>Codec: {videoCodecInfo}</div>
          </div>
          {selectedFile && videoConverter ? (
            <div className="text-sm text-gray-600">
              Video will be optimized to under 300MB with H.264/AAC encoding
            </div>
          ) : null}
        </div>
      ) : null}

      <Form.Root action={formAction}>
        <Form.Field className="mb-4 flex flex-col" key="title" name="title">
          <Form.Label className="mb-2">Title</Form.Label>
          <Form.Control
            autoComplete="off"
            className="w-full rounded text-black"
            defaultValue={state.title}
            disabled={isFormDisabled}
            placeholder="Title"
            required
            title="Title"
            type="text"
          />
          <div>
            <Form.Message match="valueMissing">Missing title.</Form.Message>
          </div>
        </Form.Field>

        <Form.Field className="mb-4 flex flex-col" key="text" name="text">
          <Form.Label className="mb-2">Message</Form.Label>
          <Form.Control
            asChild
            autoComplete="off"
            className="w-full rounded text-black"
            defaultValue={state.text}
            disabled={isFormDisabled}
            placeholder="Message"
            required
            title="Message"
          >
            <textarea rows={6} />
          </Form.Control>
          <div>
            <Form.Message match="valueMissing">Missing message.</Form.Message>
          </div>
        </Form.Field>

        <Form.Submit
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-black px-2 py-3 text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormDisabled}
        >
          {isFormDisabled ? <Spinner /> : null}
          {isFormDisabled ? "Posting..." : "Post"}
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export { PostForm };
