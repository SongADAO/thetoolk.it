"use client";

import { NeynarAuthButton, NeynarContextProvider, Theme } from "@neynar/react";
import { useState } from "react";

import { PostSettings } from "@/app/components/PostSettings";
import { BlueskyProvider } from "@/app/services/bluesky/Provider";
import { FacebookProvider } from "@/app/services/facebook/Provider";
import { InstagramProvider } from "@/app/services/instagram/Provider";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { ThreadsProvider } from "@/app/services/threads/Provider";
import { TiktokProvider } from "@/app/services/tiktok/Provider";
import { TwitterProvider } from "@/app/services/twitter/Provider";
import { YoutubeProvider } from "@/app/services/youtube/Provider";

export function Post() {
  // const [user, setUser] = useState<any | null>(null);

  // function signOutLocal() {
  //   setUser(null);
  //   localStorage.removeItem("thetoolkit-farcaster-authorization");
  // }

  return (
    <S3Provider>
      {/* <YoutubeProvider>
        <InstagramProvider>
          <FacebookProvider>
            <ThreadsProvider>
              <BlueskyProvider>
                <TiktokProvider>
                  <TwitterProvider> */}
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID ?? "",
          defaultTheme: Theme.Light,
          eventsCallbacks: {
            onAuthSuccess: () => {},
            onSignout: () => {},
            // onAuthSuccess: ({ user }) => {
            //   setUser(user);
            //   localStorage.setItem(
            //     "thetoolkit-farcaster-authorization",
            //     JSON.stringify({ user }),
            //   );
            // },
            // onSignout: () => signOutLocal(),
          },
        }}
      >
        {/* <PostSettings /> */}

        <NeynarAuthButton label="Sign in with Farcaster" />
      </NeynarContextProvider>
      {/* </TwitterProvider>
                </TiktokProvider>
              </BlueskyProvider>
            </ThreadsProvider>
          </FacebookProvider>
        </InstagramProvider>
      </YoutubeProvider> */}
    </S3Provider>
  );
}
