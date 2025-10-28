"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { ThreadsContext } from "@/services/post/threads/Context";
import { threadsProviderConfig } from "@/services/post/threads/providerConfig";

export const ThreadsProvider = createServiceProvider(
  ThreadsContext,
  threadsProviderConfig,
);
