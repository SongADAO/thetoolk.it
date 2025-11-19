import { blueskyServiceConfig } from "@/services/post/bluesky/ServiceConfig";
import { facebookServiceConfig } from "@/services/post/facebook/ServiceConfig";
import { instagramServiceConfig } from "@/services/post/instagram/ServiceConfig";
// import { neynarServiceConfig } from "@/services/post/neynar/ServiceConfig";
import { threadsServiceConfig } from "@/services/post/threads/ServiceConfig";
import { tiktokServiceConfig } from "@/services/post/tiktok/ServiceConfig";
import { twitterServiceConfig } from "@/services/post/twitter/ServiceConfig";
import { youtubeServiceConfig } from "@/services/post/youtube/ServiceConfig";

const POST_CONFIGS = [
  { config: blueskyServiceConfig, id: "bluesky", modes: ["server", "browser"] },
  {
    config: facebookServiceConfig,
    id: "facebook",
    modes: ["server", "browser"],
  },
  {
    config: instagramServiceConfig,
    id: "instagram",
    modes: ["server", "browser"],
  },
  // { config: neynarServiceConfig, id: "neynar", modes: ["server", "browser"] },
  { config: threadsServiceConfig, id: "threads", modes: ["server", "browser"] },
  { config: tiktokServiceConfig, id: "tiktok", modes: ["server"] },
  { config: twitterServiceConfig, id: "twitter", modes: ["server", "browser"] },
  { config: youtubeServiceConfig, id: "youtube", modes: ["server", "browser"] },
];

export { POST_CONFIGS };
