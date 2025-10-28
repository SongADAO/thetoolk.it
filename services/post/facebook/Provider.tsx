"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { providerConfig } from "@/services/post/facebook/providerConfig";

export const FacebookProvider = createServiceProvider(providerConfig);
