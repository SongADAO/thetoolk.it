"use client";

import { use } from "react";
import { FaYoutube } from "react-icons/fa6";

import { ServiceSwitch } from "@/app/components/ServiceSwitch";
import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";
import { YoutubeForm } from "@/app/services/youtube/YoutubeForm";

export function YoutubeAuthorize() {
  const { isComplete, isEnabled, authorize } = use(YoutubeContext);

  if (!isComplete || !isEnabled) {
    return null;
  }

  return (
    <button onClick={authorize} type="button">
      Login with Google
    </button>
  );
}
