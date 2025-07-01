"use client";

import { use } from "react";
import { FaYoutube } from "react-icons/fa6";

import { ServiceSwitch } from "@/app/components/ServiceSwitch";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeForm } from "@/app/services/youtube/Form";

export function YoutubeSwitch() {
  const { isComplete, isEnabled, configId, setIsEnabled } = use(YoutubeContext);

  return (
    <ServiceSwitch
      brandColor="youtube"
      configId={configId}
      icon={<FaYoutube className="h-6 w-6" />}
      isComplete={isComplete}
      isEnabled={isEnabled}
      label="YouTube"
      setIsEnabled={setIsEnabled}
    >
      <YoutubeForm />
    </ServiceSwitch>
  );
}
