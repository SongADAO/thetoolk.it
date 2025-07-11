"use client";

import { Form } from "radix-ui";
import { use, useActionState, useRef, useState } from "react";

import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { ThreadsContext } from "@/app/services/post/threads/Context";

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

    // await threadsPost({
    //   text: newFormState.text,
    //   title: newFormState.title,
    //   userId: threadsAccounts[0]?.id,
    //   video: selectedFile,
    //   videoUrl,
    // });

    await facebookPost({
      text: newFormState.text,
      title: newFormState.title,
      userId: facebookAccounts[0]?.id,
      video: selectedFile,
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
