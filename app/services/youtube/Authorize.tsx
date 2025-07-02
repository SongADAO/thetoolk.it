"use client";

import { use } from "react";

import { ServiceAuthorize } from "@/app/components/service/ServiceAuthorize";
import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeAuthorize() {
  const { authorize, icon, isAuthorized, isComplete, isEnabled, label } =
    use(YoutubeContext);

  return (
    <ServiceAuthorize
      authorize={authorize}
      icon={icon}
      isAuthorized={isAuthorized}
      isComplete={isComplete}
      isEnabled={isEnabled}
      label={label}
    />
  );
}
