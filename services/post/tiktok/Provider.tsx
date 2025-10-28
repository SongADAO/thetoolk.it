"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { TiktokContext } from "@/services/post/tiktok/Context";
import { tiktokProviderConfig } from "@/services/post/tiktok/providerConfig";

export const TiktokProvider = createServiceProvider(
  TiktokContext,
  tiktokProviderConfig,
);
