import { BlueskyContext } from "@/services/post/bluesky/Context";
import { FacebookContext } from "@/services/post/facebook/Context";
import { InstagramContext } from "@/services/post/instagram/Context";
import { NeynarContext } from "@/services/post/neynar/Context";
import { ThreadsContext } from "@/services/post/threads/Context";
// import { TiktokContext } from "@/services/post/tiktok/Context";
import { TwitterContext } from "@/services/post/twitter/Context";
import { YoutubeContext } from "@/services/post/youtube/Context";

const POST_CONTEXTS = [
  { context: BlueskyContext, id: "BlueskyContext" },
  { context: FacebookContext, id: "FacebookContext" },
  { context: InstagramContext, id: "InstagramContext" },
  { context: NeynarContext, id: "NeynarContext" },
  { context: ThreadsContext, id: "ThreadsContext" },
  // { context: TiktokContext, id: "TiktokContext" },
  { context: TwitterContext, id: "TwitterContext" },
  { context: YoutubeContext, id: "YoutubeContext" },
];

export { POST_CONTEXTS };
