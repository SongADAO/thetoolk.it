"use client";

import { use } from "react";
import { FaYoutube } from "react-icons/fa6";

import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";

export function YoutubeAuthorize() {
  const { isComplete, isEnabled, isAuthorized, authorize } =
    use(YoutubeContext);

  if (!isComplete || !isEnabled) {
    return null;
  }

  return (
    <button onClick={authorize} type="button">
      {isAuthorized ? "Reauthorize" : "Authorize"} YouTube
    </button>
  );
}
