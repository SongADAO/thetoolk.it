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
  const { accounts: threadsAccounts, post: threadsPost } = use(ThreadsContext);

  async function saveForm(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previousState: FormState,
    formData: FormData,
  ) {
    const newFormState = fromFormData(formData);

    const videoUrl =
      "https://thetoolkit-test.s3.us-east-1.amazonaws.com/threads-videos/1750885143834-insta.mp4";

    await threadsPost({
      text: newFormState.text,
      userId: threadsAccounts[0]?.id,
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
    </Form.Root>
  );
}

export { PostForm };
