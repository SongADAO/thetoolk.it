import { blueskyServiceConfig } from "@/services/post/bluesky/ServiceConfig";
import { facebookServiceConfig } from "@/services/post/facebook/ServiceConfig";
import { instagramServiceConfig } from "@/services/post/instagram/ServiceConfig";
// import { neynarServiceConfig } from "@/services/post/neynar/ServiceConfig";
import { threadsServiceConfig } from "@/services/post/threads/ServiceConfig";
import { tiktokServiceConfig } from "@/services/post/tiktok/ServiceConfig";
import { twitterServiceConfig } from "@/services/post/twitter/ServiceConfig";
import { youtubeServiceConfig } from "@/services/post/youtube/ServiceConfig";

const POST_CONFIGS = [
  { config: blueskyServiceConfig, id: "bluesky", modes: ["hosted", "browser"] },
  {
    config: facebookServiceConfig,
    id: "facebook",
    modes: ["hosted", "browser"],
  },
  {
    config: instagramServiceConfig,
    id: "instagram",
    modes: ["hosted", "browser"],
  },
  // { config: neynarServiceConfig, id: "neynar", modes: ["hosted", "browser"] },
  { config: threadsServiceConfig, id: "threads", modes: ["hosted", "browser"] },
  { config: tiktokServiceConfig, id: "tiktok", modes: ["hosted"] },
  { config: twitterServiceConfig, id: "twitter", modes: ["hosted", "browser"] },
  { config: youtubeServiceConfig, id: "youtube", modes: ["hosted", "browser"] },
];

export { POST_CONFIGS };
