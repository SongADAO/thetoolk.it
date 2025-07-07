import { PostSettings } from "@/app/components/PostSettings";
import { BlueskyProvider } from "@/app/services/bluesky/Provider";
import { FacebookProvider } from "@/app/services/facebook/Provider";
import { InstagramProvider } from "@/app/services/instagram/Provider";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { ThreadsProvider } from "@/app/services/threads/Provider";
import { TiktokProvider } from "@/app/services/tiktok/Provider";
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
                  <PostSettings />
                </TiktokProvider>
              </BlueskyProvider>
            </ThreadsProvider>
          </FacebookProvider>
        </InstagramProvider>
      </YoutubeProvider>
    </S3Provider>
  );
}
