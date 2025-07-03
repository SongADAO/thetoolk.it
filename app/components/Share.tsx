"use client";

import { Suspense } from "react";

import { ServiceAuthorizeWithContext } from "@/app/components/service/ServiceAuthorizeWithContext";
import { ServiceFormWithContext } from "@/app/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/app/components/service/ServiceSwitchWithContext";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeProvider } from "@/app/services/youtube/Provider";
import { YoutubeRedirectHandler } from "@/app/services/youtube/RedirectHandler";

export default function Share() {
  return (
    <div className="bg-gray-100 p-8">
      <S3Provider>
        <YoutubeProvider>
          <div>
            <div className="flex flex-col gap-1">
              <ServiceSwitchWithContext
                context={YoutubeContext}
                form={<ServiceFormWithContext context={YoutubeContext} />}
              />
              <ServiceAuthorizeWithContext context={YoutubeContext} />
            </div>
            <Suspense>
              <YoutubeRedirectHandler />
            </Suspense>
          </div>
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
