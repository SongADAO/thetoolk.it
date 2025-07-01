"use client";

import { use } from "react";

import { ServiceForm } from "@/app/components/ServiceForm";
import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeForm() {
  const { serviceFormFields, serviceFormInitial } = use(YoutubeContext);

  return (
    <ServiceForm fields={serviceFormFields} initial={serviceFormInitial} />
  );
}
