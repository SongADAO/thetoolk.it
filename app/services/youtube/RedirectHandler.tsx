"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

import { YoutubeContext } from "@/app/services/youtube/Context";

export function YoutubeRedirectHandler() {
  const { handleAuthRedirect } = use(YoutubeContext);

  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleAuthRedirect(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
