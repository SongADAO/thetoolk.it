"use client";

import { Form } from "radix-ui";
import { use, useActionState, useRef, useState } from "react";

import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { InstagramContext } from "@/app/services/post/instagram/Context";
import { NeynarContext } from "@/app/services/post/neynar/Context";
import { ThreadsContext } from "@/app/services/post/threads/Context";
import { TiktokContext } from "@/app/services/post/tiktok/Context";
import { TwitterContext } from "@/app/services/post/twitter/Context";
import { YoutubeContext } from "@/app/services/post/youtube/Context";

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
  const { accounts: threadsAccounts, post: threadsPost } = use(ThreadsContext);

  const { accounts: facebookAccounts, post: facebookPost } =
    use(FacebookContext);

  const { accounts: instagramAccounts, post: instagramPost } =
    use(InstagramContext);

  const { accounts: blueskyAccounts, post: blueskyPost } = use(BlueskyContext);

  const { accounts: youtubeAccounts, post: youtubePost } = use(YoutubeContext);

  const { accounts: neynarAccounts, post: neynarPost } = use(NeynarContext);

  const { accounts: tiktokAccounts, post: tiktokPost } = use(TiktokContext);

  const { accounts: twitterAccounts, post: twitterPost } = use(TwitterContext);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  async function saveForm(previousState: FormState, formData: FormData) {
    const newFormState = fromFormData(formData);

    console.log(previousState);

    console.log(newFormState);

    console.log(selectedFile);

    const videoUrl =
      "https://thetoolkit-test.s3.us-east-1.amazonaws.com/threads-videos/1750885143834-insta.mp4";

    const videoPlaylistUrl = `https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/manifest.m3u8`;

    const videoThumbnailUrl =
      "https://songaday.mypinata.cloud/ipfs/bafybeiaf2wbvugi6ijcrphiwjosu4oyoeqsyakhix2ubyxgolzjtysfcua/thumbnail.jpg";

    await threadsPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: threadsAccounts[0]?.id,
      username: threadsAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await facebookPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: facebookAccounts[0]?.id,
      username: facebookAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await instagramPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: instagramAccounts[0]?.id,
      username: instagramAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await blueskyPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: blueskyAccounts[0]?.id,
      username: blueskyAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await youtubePost({
      text: newFormState.text,
      title: newFormState.title,
      userId: youtubeAccounts[0]?.id,
      username: youtubeAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await neynarPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: neynarAccounts[0]?.id,
      username: neynarAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await tiktokPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: tiktokAccounts[0]?.id,
      username: tiktokAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    await twitterPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: twitterAccounts[0]?.id,
      username: twitterAccounts[0]?.username,
      video: selectedFile,
      videoPlaylistUrl,
      videoThumbnailUrl,
      videoUrl,
    });

    return newFormState;
  }

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    saveForm,
    fromInitial(),
  );

  return (
    <div>
      <Form.Root>
        <Form.Field
          className="mb-4 flex flex-col"
          key="video"
          name="video"
          // serverInvalid={hasError('video)}
        >
          <Form.Label>Title</Form.Label>
          <Form.Control
            autoComplete="off"
            className="rounded text-black"
            disabled={isPending}
            onChange={handleFileChange}
            placeholder="Title"
            ref={fileInputRef}
            required
            title="Video"
            type="file"
          />
          <div>
            <Form.Message match="valueMissing">Missing video.</Form.Message>
            {/* {getErrors("video").map((error) => (
              <Form.Message key={error}>{error}</Form.Message>
            ))} */}
          </div>
        </Form.Field>
      </Form.Root>

      <Form.Root action={formAction}>
        <Form.Field
          className="mb-4 flex flex-col"
          key="title"
          name="title"
          // serverInvalid={hasError('title)}
        >
          <Form.Label>Title</Form.Label>
          <Form.Control
            autoComplete="off"
            className="rounded text-black"
            defaultValue={state.title}
            disabled={isPending}
            placeholder="Title"
            required
            title="Title"
            type="text"
          />
          <div>
            <Form.Message match="valueMissing">Missing title.</Form.Message>
            {/* {getErrors('title').map((error) => (
            <Form.Message key={error}>{error}</Form.Message>
          ))} */}
          </div>
        </Form.Field>

        <Form.Field
          className="mb-4 flex flex-col"
          key="text"
          name="text"
          // serverInvalid={hasError('text)}
        >
          <Form.Label>Message</Form.Label>
          <Form.Control
            asChild
            autoComplete="off"
            className="rounded text-black"
            defaultValue={state.text}
            disabled={isPending}
            placeholder="Message"
            required
            title="Message"
          >
            <textarea rows={8} />
          </Form.Control>
          <div>
            <Form.Message match="valueMissing">Missing message.</Form.Message>
            {/* {getErrors('text').map((error) => (
            <Form.Message key={error}>{error}</Form.Message>
          ))} */}
          </div>
        </Form.Field>

        <Form.Submit
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-black px-2 py-3 text-white hover:bg-gray-900"
          disabled={isPending}
        >
          {isPending ? <ButtonSpinner /> : null}
          Post
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export { PostForm };
