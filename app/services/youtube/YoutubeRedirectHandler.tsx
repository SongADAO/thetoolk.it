"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";

export function YoutubeRedirectHandler() {
  const { initAuthCodes } = use(YoutubeContext);

  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const scope = searchParams.get("scope");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initAuthCodes(code, scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, scope]);

  return null;
}
