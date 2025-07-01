"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";

export function YoutubeRedirectHandler() {
  const { initAuthCodes } = use(YoutubeContext);

  const searchParams = useSearchParams();

  const queryCode = searchParams.get("code");
  const queryScope = searchParams.get("scope");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initAuthCodes(queryCode, queryScope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryCode, queryScope]);

  return null;
}
