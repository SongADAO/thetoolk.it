"use client";

import { PostServiceSettings } from "@/app/components/PostServiceSettings";
import { BlueskyContext } from "@/app/services/bluesky/Context";
import { FacebookContext } from "@/app/services/facebook/Context";
import { InstagramContext } from "@/app/services/instagram/Context";
import { NeynarContext } from "@/app/services/neynar/Context";
import { ThreadsContext } from "@/app/services/threads/Context";
import { TiktokContext } from "@/app/services/tiktok/Context";
import { TwitterContext } from "@/app/services/twitter/Context";
import { YoutubeContext } from "@/app/services/youtube/Context";

export function PostSettings() {
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
    <div className="bg-gray-100 p-8">
      <div className="flex flex-col gap-8">
        {contexts.map((context) => (
          <div className="flex flex-col gap-1" key={context.id}>
            <PostServiceSettings context={context.context} />
          </div>
        ))}
      </div>
    </div>
  );
}
