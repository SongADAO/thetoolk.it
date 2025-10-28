"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { FacebookContext } from "@/services/post/facebook/Context";
import { facebookProviderConfig } from "@/services/post/facebook/providerConfig";

export const FacebookProvider = createServiceProvider(
  FacebookContext,
  facebookProviderConfig,
);
