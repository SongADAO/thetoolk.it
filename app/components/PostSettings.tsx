"use client";

import { PostServiceSettings } from "@/app/components/PostServiceSettings";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { InstagramContext } from "@/app/services/post/instagram/Context";
import { NeynarContext } from "@/app/services/post/neynar/Context";
import { ThreadsContext } from "@/app/services/post/threads/Context";
import { TiktokContext } from "@/app/services/post/tiktok/Context";
import { TwitterContext } from "@/app/services/post/twitter/Context";
import { YoutubeContext } from "@/app/services/post/youtube/Context";

export function PostSettings() {
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
      <div className="flex flex-col gap-2">
        {contexts.map((context) => (
          <div className="flex flex-col gap-1" key={context.id}>
            <PostServiceSettings context={context.context} />
          </div>
        ))}
      </div>
    </div>
  );
}
