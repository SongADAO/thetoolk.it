import { ReactNode } from "react";

import { BlueskyProvider } from "@/app/services/post/bluesky/Provider";
import { FacebookProvider } from "@/app/services/post/facebook/Provider";
import { InstagramProvider } from "@/app/services/post/instagram/Provider";
import { NeynarProvider } from "@/app/services/post/neynar/Provider";
import { ThreadsProvider } from "@/app/services/post/threads/Provider";
import { TiktokProvider } from "@/app/services/post/tiktok/Provider";
import { TwitterProvider } from "@/app/services/post/twitter/Provider";
import { YoutubeProvider } from "@/app/services/post/youtube/Provider";

interface Props {
  children: ReactNode;
}

export function PostProviders({ children }: Readonly<Props>) {
  return (
    <YoutubeProvider>
      <InstagramProvider>
        <FacebookProvider>
          <ThreadsProvider>
            <BlueskyProvider>
              <TiktokProvider>
                <TwitterProvider>
                  <NeynarProvider>{children}</NeynarProvider>
                </TwitterProvider>
              </TiktokProvider>
            </BlueskyProvider>
          </ThreadsProvider>
        </FacebookProvider>
      </InstagramProvider>
    </YoutubeProvider>
  );
}
