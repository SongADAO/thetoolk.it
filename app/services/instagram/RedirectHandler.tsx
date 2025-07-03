"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

import { InstagramContext } from "@/app/services/instagram/Context";

export function InstagramRedirectHandler() {
  const { handleAuthRedirect } = use(InstagramContext);

  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleAuthRedirect(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
