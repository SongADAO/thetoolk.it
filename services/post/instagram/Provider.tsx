"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { InstagramContext } from "@/services/post/instagram/Context";
import { instagramServiceConfig } from "@/services/post/instagram/ServiceConfig";

export const InstagramProvider = createServiceProvider(
  InstagramContext,
  instagramServiceConfig,
);
