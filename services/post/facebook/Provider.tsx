"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { facebookProviderConfig } from "@/services/post/facebook/providerConfig";

export const FacebookProvider = createServiceProvider(facebookProviderConfig);
