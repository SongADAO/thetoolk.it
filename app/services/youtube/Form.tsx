"use client";

import { use } from "react";

import { ServiceForm } from "@/app/components/service/ServiceForm";
import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeForm() {
  const { serviceFormFields, serviceFormInitial, serviceFormSaveData } =
    use(YoutubeContext);

  return (
    <ServiceForm
      fields={serviceFormFields}
      initial={serviceFormInitial}
      saveData={serviceFormSaveData}
    />
  );
}
