"use client";

import { Form } from "radix-ui";
import { useActionState } from "react";

import { ButtonSpinner } from "@/app/components/ButtonSpinner";

interface FormState {
  message: string;
}

function fromInitial(): FormState {
  return {
    message: "",
  };
}

function fromFormData(formData: FormData): FormState {
  return {
    message: String(formData.get("message")),
  };
}

function PostForm() {
  function saveForm(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previousState: FormState,
    formData: FormData,
  ) {
    const newFormState = fromFormData(formData);

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
        key="message"
        name="message"
        // serverInvalid={hasError('message)}
      >
        <Form.Label>Message</Form.Label>
        <Form.Control
          asChild
          autoComplete="off"
          className="rounded text-black"
          defaultValue={state.message}
          disabled={isPending}
          placeholder="Message"
          required
          title="Message"
        >
          <textarea rows={8} />
        </Form.Control>
        <div>
          <Form.Message match="valueMissing">Missing message.</Form.Message>
          {/* {getErrors('message').map((error) => (
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
