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
    modes: ["hosted", "browser"],
  },
  {
    context: FacebookContext,
    hasPostFields: false,
    id: "facebook",
    modes: ["hosted", "browser"],
  },
  {
    context: InstagramContext,
    hasPostFields: false,
    id: "instagram",
    modes: ["hosted", "browser"],
  },
  {
    context: NeynarContext,
    hasPostFields: false,
    id: "neynar",
    modes: ["hosted", "browser"],
  },
  {
    context: ThreadsContext,
    hasPostFields: false,
    id: "threads",
    modes: ["hosted", "browser"],
  },
  {
    context: TiktokContext,
    hasPostFields: true,
    id: "tiktok",
    modes: ["hosted"],
  },
  {
    context: TwitterContext,
    hasPostFields: false,
    id: "twitter",
    modes: ["hosted", "browser"],
  },
  {
    context: YoutubeContext,
    hasPostFields: true,
    id: "youtube",
    modes: ["hosted", "browser"],
  },
];

export { POST_CONTEXTS };
