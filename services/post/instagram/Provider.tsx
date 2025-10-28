"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { providerConfig } from "@/services/post/instagram/providerConfig";

export const InstagramProvider = createServiceProvider(providerConfig);
