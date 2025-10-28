"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { TiktokContext } from "@/services/post/tiktok/Context";
import { tiktokServiceConfig } from "@/services/post/tiktok/ServiceConfig";

export const TiktokProvider = createServiceProvider(
  TiktokContext,
  tiktokServiceConfig,
);
