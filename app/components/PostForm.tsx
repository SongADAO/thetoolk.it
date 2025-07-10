"use client";

import { Form } from "radix-ui";
import { use, useActionState } from "react";

import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { ThreadsContext } from "@/app/services/post/threads/Context";

interface FormState {
  text: string;
}

function fromInitial(): FormState {
  return {
    text: "This is a test.",
  };
}

function fromFormData(formData: FormData): FormState {
  return {
    text: String(formData.get("text")),
  };
}

function PostForm() {
  const {
    accounts: threadsAccounts,
    post: threadsPost,
    postStatus,
    isPosting,
    postProgress,
    postError,
  } = use(ThreadsContext);

  async function saveForm(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previousState: FormState,
    formData: FormData,
  ) {
    const newFormState = fromFormData(formData);

    const userId = threadsAccounts[0]?.id;

    const videoUrl =
      "https://thetoolkit-test.s3.us-east-1.amazonaws.com/threads-videos/1750885143834-insta.mp4";

    await threadsPost({
      text: newFormState.text,
      userId,
      videoUrl,
    });

    return newFormState;
  }

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    saveForm,
    fromInitial(),
  );

  return (
    <Form.Root action={formAction}>
      {/* <Form.Field
        className="mb-4 flex flex-col"
        key="message"
        name="message"
        // serverInvalid={hasError('message)}
      >
        <Form.Label>Message</Form.Label>
        <Form.Control
          autoComplete="off"
          className="rounded text-black"
          defaultValue={state.message}
          disabled={isPending}
          placeholder="Message"
          required
          title="Message"
          type="text"
        />
        <div>
          <Form.Message match="valueMissing">Missing message.</Form.Message>
          {getErrors('message').map((error) => (
            <Form.Message key={error}>{error}</Form.Message>
          ))}
        </div>
      </Form.Field> */}

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

      {postError ? (
        <div className="mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {postError}
        </div>
      ) : null}
      {postStatus && !isPosting && postProgress === 100 ? (
        <div className="mt-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          {postStatus}
        </div>
      ) : null}
    </Form.Root>
  );
}

export { PostForm };
