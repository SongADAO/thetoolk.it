"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { YoutubeContext } from "@/services/post/youtube/Context";
import { youtubeProviderConfig } from "@/services/post/youtube/providerConfig";

export const YoutubeProvider = createServiceProvider(
  YoutubeContext,
  youtubeProviderConfig,
);
