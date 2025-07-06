"use client";

import { PostServiceSettings } from "@/app/components/PostServiceSettings";
import { FacebookContext } from "@/app/services/facebook/Context";
import { InstagramContext } from "@/app/services/instagram/Context";
import { YoutubeContext } from "@/app/services/youtube/Context";

export function PostSettings() {
  const contexts = [
    { context: YoutubeContext, id: "YoutubeContext" },
    { context: InstagramContext, id: "InstagramContext" },
    { context: FacebookContext, id: "FacebookContext" },
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
