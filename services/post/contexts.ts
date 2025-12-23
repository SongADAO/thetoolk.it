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
  {
    context: BlueskyContext,
    hasPostFields: false,
    id: "bluesky",
    modes: ["server", "browser"],
  },
  {
    context: FacebookContext,
    hasPostFields: true,
    id: "facebook",
    modes: ["server", "browser"],
  },
  {
    context: InstagramContext,
    hasPostFields: false,
    id: "instagram",
    modes: ["server", "browser"],
  },
  {
    context: NeynarContext,
    hasPostFields: false,
    id: "neynar",
    modes: ["server", "browser"],
  },
  {
    context: ThreadsContext,
    hasPostFields: false,
    id: "threads",
    modes: ["server", "browser"],
  },
  {
    context: TiktokContext,
    hasPostFields: true,
    id: "tiktok",
    modes: ["server"],
  },
  {
    context: TwitterContext,
    hasPostFields: false,
    id: "twitter",
    modes: ["server", "browser"],
  },
  {
    context: YoutubeContext,
    hasPostFields: true,
    id: "youtube",
    modes: ["server", "browser"],
  },
];

export { POST_CONTEXTS };
