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
  { context: BlueskyContext, id: "bluesky", modes: ["hosted", "self"] },
  {
    context: FacebookContext,
    id: "facebook",
    modes: ["hosted", "self"],
  },
  {
    context: InstagramContext,
    id: "instagram",
    modes: ["hosted", "self"],
  },
  { context: NeynarContext, id: "neynar", modes: ["hosted", "self"] },
  { context: ThreadsContext, id: "threads", modes: ["hosted", "self"] },
  { context: TiktokContext, id: "tiktok", modes: ["hosted"] },
  { context: TwitterContext, id: "twitter", modes: ["hosted", "self"] },
  { context: YoutubeContext, id: "youtube", modes: ["hosted", "self"] },
];

export { POST_CONTEXTS };
