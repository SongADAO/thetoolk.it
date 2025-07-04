"use client";

import { ShareServiceSettings } from "@/app/components/ShareServiceSettings";
import { InstagramContext } from "@/app/services/instagram/Context";
import { InstagramProvider } from "@/app/services/instagram/Provider";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeProvider } from "@/app/services/youtube/Provider";

export default function Share() {
  return (
    <div className="bg-gray-100 p-8">
      <S3Provider>
        <YoutubeProvider>
          <InstagramProvider>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <ShareServiceSettings context={YoutubeContext} />
              </div>

              <div className="flex flex-col gap-1">
                <ShareServiceSettings context={InstagramContext} />
              </div>
            </div>
          </InstagramProvider>
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
