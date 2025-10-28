"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { TwitterContext } from "@/services/post/twitter/Context";
import { twitterProviderConfig } from "@/services/post/twitter/providerConfig";

export const TwitterProvider = createServiceProvider(
  TwitterContext,
  twitterProviderConfig,
);
