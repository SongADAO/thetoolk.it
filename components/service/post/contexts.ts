"use client";

import { BlueskyContext } from "@/services/post/bluesky/Context";
import { FacebookContext } from "@/services/post/facebook/Context";
import { InstagramContext } from "@/services/post/instagram/Context";
import { NeynarContext } from "@/services/post/neynar/Context";
import { ThreadsContext } from "@/services/post/threads/Context";
import { TiktokContext } from "@/services/post/tiktok/Context";
import { TwitterContext } from "@/services/post/twitter/Context";
import { YoutubeContext } from "@/services/post/youtube/Context";

const POST_CONTEXTS = [
  { context: BlueskyContext, id: "BlueskyContext", modes: ["hosted", "self"] },
  {
    context: FacebookContext,
    id: "FacebookContext",
    modes: ["hosted", "self"],
  },
  {
    context: InstagramContext,
    id: "InstagramContext",
    modes: ["hosted", "self"],
  },
  { context: NeynarContext, id: "NeynarContext", modes: ["hosted", "self"] },
  { context: ThreadsContext, id: "ThreadsContext", modes: ["hosted", "self"] },
  { context: TiktokContext, id: "TiktokContext", modes: ["hosted"] },
  { context: TwitterContext, id: "TwitterContext", modes: ["hosted", "self"] },
  { context: YoutubeContext, id: "YoutubeContext", modes: ["hosted", "self"] },
];

export { POST_CONTEXTS };
