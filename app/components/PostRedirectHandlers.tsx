"use client";

import { Suspense } from "react";

import { ServiceRedirectHandlerWithContext } from "@/app/components/service/ServiceRedirectHandlerWithContext";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { InstagramContext } from "@/app/services/post/instagram/Context";
import { NeynarContext } from "@/app/services/post/neynar/Context";
import { ThreadsContext } from "@/app/services/post/threads/Context";
import { TiktokContext } from "@/app/services/post/tiktok/Context";
import { TwitterContext } from "@/app/services/post/twitter/Context";
import { YoutubeContext } from "@/app/services/post/youtube/Context";

export function PostRedirectHandlers() {
  const contexts = [
    { context: YoutubeContext, id: "YoutubeContext" },
    { context: InstagramContext, id: "InstagramContext" },
    { context: FacebookContext, id: "FacebookContext" },
    { context: ThreadsContext, id: "ThreadsContext" },
    { context: BlueskyContext, id: "BlueskyContext" },
    { context: TiktokContext, id: "TiktokContext" },
    { context: TwitterContext, id: "TwitterContext" },
    { context: NeynarContext, id: "NeynarContext" },
  ];

  return (
    <Suspense>
      {contexts.map((context) => (
        <ServiceRedirectHandlerWithContext
          context={context.context}
          key={context.id}
        />
      ))}
    </Suspense>
  );
}
