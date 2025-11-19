import { blueskyServiceConfig } from "@/services/post/bluesky/ServiceConfig";
import { facebookServiceConfig } from "@/services/post/facebook/ServiceConfig";
import { instagramServiceConfig } from "@/services/post/instagram/ServiceConfig";
import { threadsServiceConfig } from "@/services/post/threads/ServiceConfig";
import { tiktokServiceConfig } from "@/services/post/tiktok/ServiceConfig";
import { twitterServiceConfig } from "@/services/post/twitter/ServiceConfig";
import { youtubeServiceConfig } from "@/services/post/youtube/ServiceConfig";

const POST_CONFIGS = [
  { config: blueskyServiceConfig, id: "bluesky", modes: ["hosted", "self"] },
  {
    config: facebookServiceConfig,
    id: "facebook",
    modes: ["hosted", "self"],
  },
  {
    config: instagramServiceConfig,
    id: "instagram",
    modes: ["hosted", "self"],
  },
  // { config: neynarServiceConfig, id: "neynar", modes: ["hosted", "self"] },
  { config: threadsServiceConfig, id: "threads", modes: ["hosted", "self"] },
  { config: tiktokServiceConfig, id: "tiktok", modes: ["hosted"] },
  { config: twitterServiceConfig, id: "twitter", modes: ["hosted", "self"] },
  { config: youtubeServiceConfig, id: "youtube", modes: ["hosted", "self"] },
];

export { POST_CONFIGS };
