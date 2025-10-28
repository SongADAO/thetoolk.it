"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { twitterProviderConfig } from "@/services/post/twitter/providerConfig";

export const TwitterProvider = createServiceProvider(twitterProviderConfig);
