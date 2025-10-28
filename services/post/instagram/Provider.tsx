"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { instagramProviderConfig } from "@/services/post/instagram/providerConfig";

export const InstagramProvider = createServiceProvider(instagramProviderConfig);
