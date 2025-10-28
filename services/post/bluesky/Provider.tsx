"use client";

import { BlueskyContext } from "@/services/post/bluesky/Context";
import { blueskyProviderConfig } from "@/services/post/bluesky/providerConfig";
import { createServiceProvider } from "@/services/post/createServiceProvider";

export const BlueskyProvider = createServiceProvider(
  BlueskyContext,
  blueskyProviderConfig,
);
