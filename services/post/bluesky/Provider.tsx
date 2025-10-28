"use client";

import { BlueskyContext } from "@/services/post/bluesky/Context";
import { blueskyServiceConfig } from "@/services/post/bluesky/ServiceConfig";
import { createServiceProvider } from "@/services/post/createServiceProvider";

export const BlueskyProvider = createServiceProvider(
  BlueskyContext,
  blueskyServiceConfig,
);
