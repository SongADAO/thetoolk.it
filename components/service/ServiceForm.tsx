import { Form } from "radix-ui";
import { useActionState } from "react";

import { Spinner } from "@/components/general/Spinner";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        >
          <Form.Label className="block w-auto rounded-t-xs bg-[#fff] px-2 py-1 text-sm text-black">
            {field.label}
          </Form.Label>
          <Form.Control
            autoComplete="off"
            className="rounded-b-xs border-0 p-2 text-black"
            defaultValue={state[field.name]}
            disabled={isPending}
            placeholder={field.placeholder}
            title={field.label}
            type="text"
          />
          <div>
            <Form.Message match="valueMissing">
              Missing {field.label}.
            </Form.Message>
          </div>
        </Form.Field>
      ))}

      <Form.Submit
        className="w-full cursor-pointer gap-2 rounded-xs border border-gray-400 border-r-black border-b-black bg-white px-4 py-2 text-black shadow-md hover:bg-gray-900 hover:text-white"
        disabled={isPending}
      >
        {isPending ? <Spinner /> : null}
        Save API Settings
      </Form.Submit>
    </Form.Root>
  );
}

export { ServiceForm, type ServiceFormField, type ServiceFormState };
