"use client";

import { Suspense } from "react";

import { ServiceAuthorizeWithContext } from "@/app/components/service/ServiceAuthorizeWithContext";
import { ServiceFormWithContext } from "@/app/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/app/components/service/ServiceSwitchWithContext";
import { InstagramContext } from "@/app/services/instagram/Context";
import { InstagramProvider } from "@/app/services/instagram/Provider";
import { InstagramRedirectHandler } from "@/app/services/instagram/RedirectHandler";
import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeProvider } from "@/app/services/youtube/Provider";
import { YoutubeRedirectHandler } from "@/app/services/youtube/RedirectHandler";

export default function Share() {
  return (
    <div className="bg-gray-100 p-8">
      <S3Provider>
        <YoutubeProvider>
          <InstagramProvider>
            <div>
              <div className="flex flex-col gap-1">
                <ServiceSwitchWithContext
                  context={YoutubeContext}
                  form={<ServiceFormWithContext context={YoutubeContext} />}
                />
                <ServiceAuthorizeWithContext context={YoutubeContext} />
              </div>

              <div className="flex flex-col gap-1">
                <ServiceSwitchWithContext
                  context={InstagramContext}
                  form={<ServiceFormWithContext context={InstagramContext} />}
                />
                <ServiceAuthorizeWithContext context={InstagramContext} />
              </div>
              <Suspense>
                <YoutubeRedirectHandler />
                <InstagramRedirectHandler />
              </Suspense>
            </div>
          </InstagramProvider>
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
