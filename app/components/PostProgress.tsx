"use client";

import { ServiceProgressWithContext } from "@/app/components/service/ServiceProgressWithContext";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { InstagramContext } from "@/app/services/post/instagram/Context";
import { NeynarContext } from "@/app/services/post/neynar/Context";
import { ThreadsContext } from "@/app/services/post/threads/Context";
import { TiktokContext } from "@/app/services/post/tiktok/Context";
import { TwitterContext } from "@/app/services/post/twitter/Context";
import { YoutubeContext } from "@/app/services/post/youtube/Context";

export function PostProgress() {
  const contexts = [
    { context: BlueskyContext, id: "BlueskyContext" },
    { context: FacebookContext, id: "FacebookContext" },
    { context: InstagramContext, id: "InstagramContext" },
    { context: NeynarContext, id: "NeynarContext" },
    { context: ThreadsContext, id: "ThreadsContext" },
    { context: TiktokContext, id: "TiktokContext" },
    { context: TwitterContext, id: "TwitterContext" },
    { context: YoutubeContext, id: "YoutubeContext" },
  ];

  return (
    <div>
      {contexts.map((context) => (
        <div key={context.id}>
          <ServiceProgressWithContext context={context.context} />
        </div>
      ))}
    </div>
  );
}
