import { PostSettings } from "@/app/components/PostSettings";
import { BlueskyProvider } from "@/app/services/post/bluesky/Provider";
import { FacebookProvider } from "@/app/services/post/facebook/Provider";
import { InstagramProvider } from "@/app/services/post/instagram/Provider";
import { NeynarProvider } from "@/app/services/post/neynar/Provider";
import { ThreadsProvider } from "@/app/services/post/threads/Provider";
import { TiktokProvider } from "@/app/services/post/tiktok/Provider";
import { TwitterProvider } from "@/app/services/post/twitter/Provider";
import { YoutubeProvider } from "@/app/services/post/youtube/Provider";
import { S3Provider } from "@/app/services/storage/s3/S3Provider";

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
