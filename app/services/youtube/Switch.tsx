"use client";

import { use } from "react";

import { ServiceSwitch } from "@/app/components/service/ServiceSwitch";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeForm } from "@/app/services/youtube/Form";

export function YoutubeSwitch() {
  const {
    brandColor,
    configId,
    icon,
    isComplete,
    isEnabled,
    label,
    setIsEnabled,
  } = use(YoutubeContext);

  return (
    <ServiceSwitch
      brandColor={brandColor}
      configId={configId}
      icon={icon}
      isComplete={isComplete}
      isEnabled={isEnabled}
      label={label}
      setIsEnabled={setIsEnabled}
    >
      <YoutubeForm />
    </ServiceSwitch>
  );
}
