import { ReactNode } from "react";

import { BlueskyProvider } from "@/services/post/bluesky/Provider";
import { FacebookProvider } from "@/services/post/facebook/Provider";
import { InstagramProvider } from "@/services/post/instagram/Provider";
import { NeynarProvider } from "@/services/post/neynar/Provider";
import { ThreadsProvider } from "@/services/post/threads/Provider";
import { TiktokProvider } from "@/services/post/tiktok/Provider";
import { TwitterProvider } from "@/services/post/twitter/Provider";
import { YoutubeProvider } from "@/services/post/youtube/Provider";

interface Props {
  mode: string;
  children: ReactNode;
}

export function PostProviders({ mode, children }: Readonly<Props>) {
  return (
    <NeynarProvider mode={mode}>
      <TwitterProvider mode={mode}>
        <TiktokProvider mode={mode}>
          <BlueskyProvider mode={mode}>
            <ThreadsProvider mode={mode}>
              <FacebookProvider mode={mode}>
                <InstagramProvider mode={mode}>
                  <YoutubeProvider mode={mode}>{children}</YoutubeProvider>
                </InstagramProvider>
              </FacebookProvider>
            </ThreadsProvider>
          </BlueskyProvider>
        </TiktokProvider>
      </TwitterProvider>
    </NeynarProvider>
  );
}
