"use client";

import { createServiceProvider } from "@/services/post/createServiceProvider";
import { ThreadsContext } from "@/services/post/threads/Context";
import { threadsServiceConfig } from "@/services/post/threads/ServiceConfig";

export const ThreadsProvider = createServiceProvider(
  ThreadsContext,
  threadsServiceConfig,
);
