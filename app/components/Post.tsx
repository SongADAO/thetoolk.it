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
  const [user, setUser] = useState<any | null>(null);

  function signOutLocal() {
    setUser(null);
    localStorage.removeItem("thetoolkit-farcaster-authorization");
  }

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
            onAuthSuccess: ({ signer_uuid, user }) => {
              setUser(user);
              localStorage.setItem(
                "thetoolkit-farcaster-authorization",
                JSON.stringify({ user }),
              );
            },
            onSignout: () => signOutLocal(),
          },
        }}
      >
        {/* <PostSettings /> */}

        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                alt="Avatar"
                className="h-12 w-12 rounded-full"
                src={user.pfp_url}
              />
              <div>
                <p className="font-semibold">{user.display_name}</p>
                <p className="text-gray-600">@{user.username}</p>
                <p className="text-sm text-gray-500">FID: {user.fid}</p>
              </div>
            </div>
            <button
              className="rounded bg-gray-700 px-4 py-2 text-white"
              onClick={signOutLocal}
              type="button"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-gray-600">
              Connect your Farcaster account:
            </p>
            <NeynarAuthButton label="Sign in with Farcaster" />
          </div>
        )}
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
