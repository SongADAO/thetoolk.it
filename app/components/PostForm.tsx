"use client";

import { Form } from "radix-ui";
import { use, useRef, useState } from "react";

import { Spinner } from "@/app/components/Spinner";
import { formatFileDuration, formatFileSize } from "@/app/lib/video";
import { PostContext } from "@/app/services/PostContext";

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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    getVideoInfo(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        text: newFormState.text,
        title: newFormState.title,
        videos,
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
