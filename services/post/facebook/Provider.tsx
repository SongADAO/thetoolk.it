"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { FacebookContext } from "@/services/post/facebook/Context";
import { facebookServiceConfig } from "@/services/post/facebook/ServiceConfig";

export const FacebookProvider = createServiceProvider(
  FacebookContext,
  facebookServiceConfig,
);
