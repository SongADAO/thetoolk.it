"use client";

import { use } from "react";

import {
  ServiceForm,
  type ServiceFormField,
  type ServiceFormState,
} from "@/app/components/ServiceForm";
import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeForm() {
  const { clientId, setClientId, clientSecret, setClientSecret } =
    use(YoutubeContext);

  const initial: ServiceFormState = {
    clientId,
    clientSecret,
  };

  const fields: ServiceFormField[] = [
    {
      label: "Client ID",
      name: "clientId",
      placeholder: "Client ID",
      setter: setClientId,
    },
    {
      label: "Client Secret",
      name: "clientSecret",
      placeholder: "Client Secret",
      setter: setClientSecret,
    },
  ];

  return <ServiceForm fields={fields} initial={initial} />;
}
