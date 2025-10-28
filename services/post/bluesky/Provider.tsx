"use client";

import { blueskyProviderConfig } from "@/services/post/bluesky/providerConfig";
import { createServiceProvider } from "@/services/post/createServiceProvider";

export const BlueskyProvider = createServiceProvider(blueskyProviderConfig);
