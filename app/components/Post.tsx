import { PostSettings } from "@/app/components/PostSettings";
import { BlueskyProvider } from "@/app/services/bluesky/Provider";
import { FacebookProvider } from "@/app/services/facebook/Provider";
import { InstagramProvider } from "@/app/services/instagram/Provider";
import { NeynarProvider } from "@/app/services/neynar/Provider";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { ThreadsProvider } from "@/app/services/threads/Provider";
import { TiktokProvider } from "@/app/services/tiktok/Provider";
import { TwitterProvider } from "@/app/services/twitter/Provider";
import { YoutubeProvider } from "@/app/services/youtube/Provider";

export function Post() {
  return (
    <S3Provider>
      <YoutubeProvider>
        <InstagramProvider>
          <FacebookProvider>
            <ThreadsProvider>
              <BlueskyProvider>
                <TiktokProvider>
                  <TwitterProvider>
                    <NeynarProvider>
                      <PostSettings />
                    </NeynarProvider>
                  </TwitterProvider>
                </TiktokProvider>
              </BlueskyProvider>
            </ThreadsProvider>
          </FacebookProvider>
        </InstagramProvider>
      </YoutubeProvider>
    </S3Provider>
  );
}
