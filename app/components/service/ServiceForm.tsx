import { Form } from "radix-ui";
import { useActionState } from "react";

import { Spinner } from "@/app/components/Spinner";

type ServiceFormState = Record<string, string>;

interface ServiceFormField {
  label: string;
  name: string;
  placeholder: string;
}

interface Props {
  fields: ServiceFormField[];
  initial: ServiceFormState;
  saveData: (formState: ServiceFormState) => ServiceFormState;
}

function ServiceForm({ fields, initial, saveData }: Readonly<Props>) {
  function fromFormData(formData: FormData): ServiceFormState {
    return Object.fromEntries(
      fields.map((field) => [field.name, String(formData.get(field.name))]),
    );
  }

  function saveForm(
    previousState: ServiceFormState,
    formData: FormData,
  ): ServiceFormState {
    return saveData(fromFormData(formData));
  }

  const [state, formAction, isPending] = useActionState<
    ServiceFormState,
    FormData
  >(saveForm, initial);

  return (
    <Form.Root action={formAction}>
      {fields.map((field) => (
        <Form.Field
          className="mb-2 flex flex-col"
          key={field.name}
          name={field.name}
          // serverInvalid={hasError(field.name)}
        >
          <Form.Label className="block w-auto rounded-t bg-[#fff] px-2 py-1 text-sm text-black">
            {field.label}
          </Form.Label>
          <Form.Control
            autoComplete="off"
            className="rounded-b border-0 p-2 text-black"
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#000] px-2 py-3 text-white hover:bg-gray-900"
        disabled={isPending}
      >
        {isPending ? <Spinner /> : null}
        Save API Settings
      </Form.Submit>
    </Form.Root>
  );
}

export { ServiceForm, type ServiceFormField, type ServiceFormState };
