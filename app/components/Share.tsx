import { Suspense } from "react";

import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeAuthorize } from "@/app/services/youtube/Authorize";
import { YoutubeProvider } from "@/app/services/youtube/Provider";
import { YoutubeRedirectHandler } from "@/app/services/youtube/RedirectHandler";
import { YoutubeSwitch } from "@/app/services/youtube/Switch";

export default function Share() {
  return (
    <div className="bg-gray-100 p-8">
      <S3Provider>
        <YoutubeProvider>
          <div>
            <YoutubeSwitch />
            <YoutubeAuthorize />
            <Suspense>
              <YoutubeRedirectHandler />
            </Suspense>
          </div>
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
