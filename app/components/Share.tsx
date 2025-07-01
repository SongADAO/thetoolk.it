"use client";

import { S3Provider } from "@/app/services/s3/S3Provider";
import { YoutubeProvider } from "@/app/services/youtube/YoutubeProvider";

import { YoutubeForm } from "../services/youtube/YoutubeForm";

export default function Share() {
  return (
    <div>
      <S3Provider>
        <YoutubeProvider>
          <YoutubeForm />
          <div>TODO</div>
        </YoutubeProvider>
      </S3Provider>
    </div>
  );
}
