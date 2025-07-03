"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

import { InstagramContext } from "@/app/services/instagram/Context";

export function InstagramRedirectHandler() {
  const { initAuthCodes } = use(InstagramContext);

  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initAuthCodes(code, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, state]);

  return null;
}
