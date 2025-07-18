"use client";
import { Form } from "radix-ui";
import { use, useActionState, useRef, useState } from "react";

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
    createPost,
    getVideoInfo,
    isVideoConverting,
    preparePostVideo,
    videoCodecInfo,
    videoConversionProgress,
    videoDuration,
    videoFileSize,
    videoPreviewUrl,
  } = use(PostContext);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState<string>("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    await getVideoInfo(file);
  }

  async function saveForm(previousState: FormState, formData: FormData) {
    const newFormState = fromFormData(formData);
    console.log(newFormState);

    try {
      const { video, videoHSLUrl, videoUrl } = selectedFile
        ? await preparePostVideo(selectedFile)
        : {
            video: null,
            videoHSLUrl: "",
            videoUrl: "",
          };

      // const video = selectedFile;
      // const videoUrl = "https://thetoolkit-test.s3.us-east-1.amazonaws.com/example2.mp4";
      // const videoHSLUrl = "https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8";

      await createPost({
        text: newFormState.text,
        title: newFormState.title,
        video,
        videoHSLUrl,
        videoUrl,
      });
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Post failed";
      setError(errMessage);

      console.error(err);
    }

    return newFormState;
  }

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    saveForm,
    fromInitial(),
  );

  // Check if we should disable the form
  const isFormDisabled = isPending || isVideoConverting;

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

      {isVideoConverting ? (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-yellow-800">
          <div className="flex items-center gap-2">
            <Spinner />
            Converting video for optimal quality and size...
          </div>
          {videoConversionProgress > 0 && (
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-yellow-200">
                <div
                  className="h-2 rounded bg-yellow-600 transition-all duration-300"
                  style={{ width: `${videoConversionProgress}%` }}
                />
              </div>
              <div className="mt-1 text-sm">
                {videoConversionProgress}% complete
              </div>
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
