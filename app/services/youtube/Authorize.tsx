"use client";

import { use } from "react";

import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeAuthorize() {
  const { isComplete, isEnabled, isAuthorized, authorize, icon } =
    use(YoutubeContext);

  if (!isComplete || !isEnabled) {
    return null;
  }

  return (
    <button onClick={authorize} type="button">
      {isAuthorized ? "Reauthorize" : "Authorize"} YouTube {icon}
    </button>
  );
}
