"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { InstagramContext } from "@/services/post/instagram/Context";
import { instagramProviderConfig } from "@/services/post/instagram/providerConfig";

export const InstagramProvider = createServiceProvider(
  InstagramContext,
  instagramProviderConfig,
);
