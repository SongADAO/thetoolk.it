"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { youtubeProviderConfig } from "@/services/post/youtube/providerConfig";

export const YoutubeProvider = createServiceProvider(youtubeProviderConfig);
