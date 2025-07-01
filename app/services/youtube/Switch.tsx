"use client";

import { use } from "react";

import { ServiceSwitch } from "@/app/components/ServiceSwitch";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeForm } from "@/app/services/youtube/Form";

export function YoutubeSwitch() {
  const {
    brandColor,
    label,
    icon,
    isComplete,
    isEnabled,
    configId,
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
