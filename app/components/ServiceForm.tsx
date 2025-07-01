"use client";

import { Form } from "radix-ui";
import { useActionState } from "react";

import { ButtonSpinner } from "@/app/components/ButtonSpinner";

type ServiceFormState = Record<string, string>;

interface ServiceFormField {
  label: string;
  name: string;
  placeholder: string;
  setter: (value: string) => void;
}

interface Props {
  initial: ServiceFormState;
  fields: ServiceFormField[];
}

function ServiceForm({ initial, fields }: Readonly<Props>) {
  function fromFormData(formData: FormData): ServiceFormState {
    return Object.fromEntries(
      fields.map((field) => [field.name, String(formData.get(field.name))]),
    );
  }

  function saveForm(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previousState: ServiceFormState,
    formData: FormData,
  ): ServiceFormState {
    return fields.reduce((state, { name, setter }) => {
      setter(state[name]);
      return state;
    }, fromFormData(formData));
  }

  const [state, formAction, isPending] = useActionState<
    ServiceFormState,
    FormData
  >(saveForm, initial);

  return (
    <Form.Root action={formAction}>
      {fields.map((field) => (
        <Form.Field
          className="mb-4 flex flex-col"
          key={field.name}
          name={field.name}
          // serverInvalid={hasError(field.name)}
        >
          <Form.Label>{field.label}</Form.Label>
          <Form.Control
            autoComplete="off"
            defaultValue={state[field.name]}
            disabled={isPending}
            placeholder={field.placeholder}
            // required
            title={field.label}
            type="text"
          />
          <div>
            <Form.Message match="valueMissing">
              Missing {field.label}.
            </Form.Message>
            {/* {getErrors(field.name).map((error) => (
              <Form.Message key={error}>{error}</Form.Message>
            ))} */}
          </div>
        </Form.Field>
      ))}

      <Form.Submit
        className="w-full rounded bg-black px-2 py-2 text-white"
        disabled={isPending}
      >
        {isPending ? <ButtonSpinner /> : null}
        Save
      </Form.Submit>
    </Form.Root>
  );
}

export { ServiceForm, type ServiceFormField, type ServiceFormState };
