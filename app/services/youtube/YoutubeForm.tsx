"use client";

import { Form } from "radix-ui";
import { use, useActionState } from "react";

import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";

interface FormState {
  clientId: string;
  clientSecret: string;
}

export function YoutubeForm() {
  const { clientId, setClientId, clientSecret, setClientSecret } =
    use(YoutubeContext);

  function fromInitial(): FormState {
    return {
      clientId,
      clientSecret,
    };
  }

  function fromFormData(formData: FormData): FormState {
    return {
      clientId: String(formData.get("clientId")),
      clientSecret: String(formData.get("clientSecret")),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function saveForm(previousState: FormState, formData: FormData): FormState {
    const newState = fromFormData(formData);
    setClientId(newState.clientId);
    setClientSecret(newState.clientSecret);

    return newState;
  }

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    saveForm,
    fromInitial(),
  );

  return (
    <Form.Root action={formAction}>
      <Form.Field
        className="mb-4 flex flex-col"
        name="clientId"
        // serverInvalid={hasError("clientId")}
      >
        <Form.Label>Client ID</Form.Label>
        <Form.Control
          defaultValue={state.clientId}
          disabled={isPending}
          placeholder="Client ID"
          required
          title="Client ID"
          type="text"
        />
        <div>
          <Form.Message match="valueMissing">Missing client ID.</Form.Message>
          {/* {getErrors("clientId").map((error) => (
            <Form.Message key={error}>{error}</Form.Message>
          ))} */}
        </div>
      </Form.Field>

      <Form.Field
        className="mb-4 flex flex-col"
        name="clientSecret"
        // serverInvalid={hasError("clientSecret")}
      >
        <Form.Label>Client Secret</Form.Label>
        <Form.Control
          defaultValue={state.clientSecret}
          disabled={isPending}
          placeholder="Client Secret"
          required
          title="Client Secret"
          type="text"
        />
        <div>
          <Form.Message match="valueMissing">
            Missing client secret.
          </Form.Message>
          {/* {getErrors("clientSecret").map((error) => (
            <Form.Message key={error}>{error}</Form.Message>
          ))} */}
        </div>
      </Form.Field>

      <Form.Submit disabled={isPending}>
        {isPending ? <ButtonSpinner /> : null}
        Save
      </Form.Submit>
    </Form.Root>
  );
}
