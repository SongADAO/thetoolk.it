"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { YoutubeContext } from "@/services/post/youtube/Context";
import { youtubeServiceConfig } from "@/services/post/youtube/ServiceConfig";

export const YoutubeProvider = createServiceProvider(
  YoutubeContext,
  youtubeServiceConfig,
);
