"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { TwitterContext } from "@/services/post/twitter/Context";
import { twitterServiceConfig } from "@/services/post/twitter/ServiceConfig";

export const TwitterProvider = createServiceProvider(
  TwitterContext,
  twitterServiceConfig,
);
