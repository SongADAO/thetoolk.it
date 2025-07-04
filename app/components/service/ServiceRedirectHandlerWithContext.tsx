"use client";

import { useSearchParams } from "next/navigation";
import { Context, use, useEffect } from "react";

interface ServiceRedirectHandlerProps {
  readonly handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
}

interface Props<T extends ServiceRedirectHandlerProps> {
  readonly context: Context<T>;
}

export function ServiceRedirectHandlerWithContext<
  T extends ServiceRedirectHandlerProps,
>({ context }: Props<T>) {
  const contextValue = use(context);

  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    contextValue.handleAuthRedirect(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
