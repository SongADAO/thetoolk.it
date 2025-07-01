import { Suspense } from "react";

import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeAuthorize } from "@/app/services/youtube/YoutubeAuthorize";
import { YoutubeProvider } from "@/app/services/youtube/YoutubeProvider";
import { YoutubeRedirectHandler } from "@/app/services/youtube/YoutubeRedirectHandler";
import { YoutubeSwitch } from "@/app/services/youtube/YoutubeSwitch";

export default function Share() {
  return (
    <div className="bg-gray-100 p-8">
      <S3Provider>
        <YoutubeProvider>
          <YoutubeSwitch />
          <YoutubeAuthorize />
          <Suspense fallback={<div>Loading...</div>}>
            <YoutubeRedirectHandler />
          </Suspense>
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
