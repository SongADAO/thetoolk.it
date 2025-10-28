"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { threadsProviderConfig } from "@/services/post/threads/providerConfig";

export const ThreadsProvider = createServiceProvider(threadsProviderConfig);
