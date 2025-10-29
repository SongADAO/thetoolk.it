"use client";

import { Form } from "radix-ui";
import { type ChangeEvent, type FormEvent, use, useRef, useState } from "react";

import { Spinner } from "@/components/Spinner";
import { formatFileDuration, formatFileSize } from "@/lib/video";
// import { BlueskyContext } from "@/services/post/bluesky/Context";
// import { FacebookContext } from "@/services/post/facebook/Context";
// import { InstagramContext } from "@/services/post/instagram/Context";
// import { NeynarContext } from "@/services/post/neynar/Context";
// import { ThreadsContext } from "@/services/post/threads/Context";
// import { TiktokContext } from "@/services/post/tiktok/Context";
// import { TwitterContext } from "@/services/post/twitter/Context";
import { YoutubeContext } from "@/services/post/youtube/Context";
import { PostContext } from "@/services/PostContext";

interface FormState {
  facebookPrivacy: string;
  text: string;
  title: string;
  youtubePrivacy: string;
}

function fromInitial(): FormState {
  return {
    facebookPrivacy: "",
    text: "",
    title: "",
    youtubePrivacy: "",
  };
}

function fromFormData(formData: FormData): FormState {
  return {
    facebookPrivacy: String(formData.get("facebookPrivacy")),
    text: String(formData.get("text")),
    title: String(formData.get("title")),
    youtubePrivacy: String(formData.get("youtubePrivacy")),
  };
}

function PostForm() {
  // Post services.
  // const bluesky = use(BlueskyContext);
  // const facebook = use(FacebookContext);
  // const instagram = use(InstagramContext);
  // const neynar = use(NeynarContext);
  // const threads = use(ThreadsContext);
  // const tiktok = use(TiktokContext);
  // const twitter = use(TwitterContext);
  const youtube = use(YoutubeContext);

  const {
    canPostToAllServices,
    canStoreToAllServices,
    createPost,
    getVideoInfo,
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
    videoConversionProgress,
    videoConversionStatus,
    videoDuration,
    videoFileSize,
    videoPreviewUrl,
    videoTrimProgress,
    videoTrimStatus,
  } = use(PostContext);

  const [state, setState] = useState<FormState>(fromInitial());

  const [isPending, setIsPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState<string>("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    getVideoInfo(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      setIsPending(true);
      setError("");

      const formData = new FormData(event.currentTarget);
      const newFormState = fromFormData(formData);
      setState(newFormState);

      resetPostState();
      resetStoreState();

      if (!newFormState.text) {
        throw new Error("Please enter a message.");
      }

      if (!newFormState.title) {
        throw new Error("Please enter a title.");
      }

      if (!selectedFile) {
        throw new Error("Please select a video file.");
      }

      if (!canPostToAllServices) {
        throw new Error("Some selected posting services are not authorized.");
      }

      if (!canStoreToAllServices) {
        throw new Error("Some selected storage services are not authorized.");
      }

      const videos = await preparePostVideo(selectedFile);

      // const videos = selectedFile
      //   ? await preparePostVideo(selectedFile)
      //   : {
      //       full: {
      //         video: null,
      //         videoHSLUrl: "",
      //         videoUrl: "",
      //       },
      //     };

      // const video = selectedFile;
      // const videoUrl = "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
      // const videoHSLUrl = "https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8";

      await createPost({
        facebookPrivacy: newFormState.facebookPrivacy,
        text: newFormState.text,
        title: newFormState.title,
        videos,
        youtubePrivacy: newFormState.youtubePrivacy,
      });
    } catch (err: unknown) {
      console.error(err);
      const errMessage = err instanceof Error ? err.message : "Post failed";
      setError(errMessage);
    } finally {
      setIsPending(false);
    }
  }

  // Check if we should disable the form
  const isFormDisabled =
    isPending || !canPostToAllServices || !canStoreToAllServices;

  const youtubePrivacyOptions = [
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
    { label: "Unlisted", value: "unlisted" },
  ];

  // const facebookPrivacyOptions = [
  //   { label: "Only Me", value: "SELF" },
  //   { label: "All Friends", value: "ALL_FRIENDS" },
  //   { label: "Public", value: "EVERYONE" },
  // ];

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
          {/* <div className="flex items-center justify-between gap-2 text-sm">
            <div>Codec: {videoCodecInfo}</div>
          </div> */}
        </div>
      ) : null}

      <Form.Root onSubmit={handleSubmit}>
        <Form.Field className="mb-4 flex flex-col" key="title" name="title">
          <Form.Label className="mb-2">Title</Form.Label>
          <Form.Control
            autoComplete="off"
            className="w-full rounded text-black"
            disabled={isFormDisabled}
            onChange={(e) =>
              setState((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Title"
            required
            title="Title"
            type="text"
            value={state.title}
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
            disabled={isFormDisabled}
            onChange={(e) =>
              setState((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Message"
            required
            title="Message"
            value={state.text}
          >
            <textarea rows={6} />
          </Form.Control>
          <div>
            <Form.Message match="valueMissing">Missing message.</Form.Message>
          </div>
        </Form.Field>

        {/* {facebook.isEnabled ? (
          <Form.Field
            className="mb-4 flex flex-col"
            key="facebookPrivacy"
            name="facebookPrivacy"
          >
            <Form.Label className="mb-2">Facebook Privacy Settings</Form.Label>
            <Form.Control
              asChild
              className="w-full rounded text-black"
              disabled={isFormDisabled}
              required
              title="Facebook Privacy"
              value={state.facebookPrivacy}
            >
              <select
                onInput={(e: ChangeEvent<HTMLSelectElement>) =>
                  setState((prev) => ({
                    ...prev,
                    facebookPrivacy: e.target.value,
                  }))
                }
              >
                <option key="none" value="">
                  Select Facebook Privacy Settings
                </option>
                {facebookPrivacyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Form.Control>
            <div>
              <Form.Message match="valueMissing">
                Missing Facebook Privacy Settings.
              </Form.Message>
            </div>
          </Form.Field>
        ) : (
          <Form.Field
            className="mb-4 flex flex-col"
            key="facebookPrivacy"
            name="facebookPrivacy"
          >
            <Form.Control type="hidden" value={state.youtubePrivacy} />
          </Form.Field>
        )} */}

        {youtube.isEnabled ? (
          <Form.Field
            className="mb-4 flex flex-col"
            key="youtubePrivacy"
            name="youtubePrivacy"
          >
            <Form.Label className="mb-2">YouTube Privacy Settings</Form.Label>
            <Form.Control
              asChild
              className="w-full rounded text-black"
              disabled={isFormDisabled}
              required
              title="YouTube Privacy"
              value={state.youtubePrivacy}
            >
              <select
                onInput={(e: ChangeEvent<HTMLSelectElement>) =>
                  setState((prev) => ({
                    ...prev,
                    youtubePrivacy: e.target.value,
                  }))
                }
              >
                <option key="none" value="">
                  Select YouTube Privacy Settings
                </option>
                {youtubePrivacyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Form.Control>
            <div>
              <Form.Message match="valueMissing">
                Missing YouTube Privacy Settings.
              </Form.Message>
            </div>
          </Form.Field>
        ) : (
          <Form.Field
            className="mb-4 flex flex-col"
            key="youtubePrivacy"
            name="youtubePrivacy"
          >
            <Form.Control type="hidden" value={state.youtubePrivacy} />
          </Form.Field>
        )}

        {isVideoConverting ? (
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {videoConversionStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-gray-600">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
                  style={{ width: `${videoConversionProgress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-sm">
                {videoConversionProgress}% complete
              </div>
            </div>
          </div>
        ) : null}

        {isVideoTrimming ? (
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {videoTrimStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-gray-600">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
                  style={{ width: `${videoTrimProgress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-sm">
                {videoTrimProgress}% complete
              </div>
            </div>
          </div>
        ) : null}

        {isHLSConverting ? (
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              {hlsConversionStatus}
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-gray-600">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
                  style={{ width: `${hlsConversionProgress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-sm">
                {hlsConversionProgress}% complete
              </div>
            </div>
          </div>
        ) : null}

        {isStoring ? (
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              Uploading videos to storage...
            </div>
          </div>
        ) : null}

        {isPosting ? (
          <div className="mb-4 rounded bg-gray-500 p-3 text-white">
            <div className="flex items-center gap-2">
              <Spinner />
              Submitting posts to services...
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mb-4 rounded bg-red-800 p-2 text-center text-white">
            {error}
          </p>
        ) : null}

        {canPostToAllServices ? null : (
          <p className="mb-4 rounded bg-red-800 p-2 text-center text-white">
            Some enabled posting services are not authorized. Finish authorizing
            them before posting.
          </p>
        )}

        {canStoreToAllServices ? null : (
          <p className="mb-4 rounded bg-red-800 p-2 text-center text-white">
            Some enabled storage services are not authorized. Finish authorizing
            them before posting.
          </p>
        )}

        <Form.Submit
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-black px-2 py-3 text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormDisabled}
        >
          {isPending ? <Spinner /> : null}
          {isPending ? "Posting..." : "Post"}
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export { PostForm };
