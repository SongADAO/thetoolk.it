"use client";

import { use } from "react";

import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeAuthorize() {
  const { authorize, icon, isAuthorized, isComplete, isEnabled, label } =
    use(YoutubeContext);

  if (!isComplete || !isEnabled) {
    return null;
  }

  return (
    <button onClick={authorize} type="button">
      {isAuthorized ? "Reauthorize" : "Authorize"} {label} {icon}
    </button>
  );
}
