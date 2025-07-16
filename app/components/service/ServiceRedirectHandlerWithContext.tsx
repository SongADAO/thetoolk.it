"use client";

import { useSearchParams } from "next/navigation";
import { Context, use, useEffect } from "react";

interface ServiceRedirectHandlerProps {
  readonly handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
  readonly hasCompletedAuth: boolean;
  readonly isHandlingAuth: boolean;
  readonly label: string;
}

interface Props<T extends ServiceRedirectHandlerProps> {
  readonly context: Context<T>;
}

export function ServiceRedirectHandlerWithContext<
  T extends ServiceRedirectHandlerProps,
>({ context }: Props<T>) {
  const { handleAuthRedirect, isHandlingAuth, hasCompletedAuth, label } =
    use(context);

  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleAuthRedirect(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  console.log("isHandlingAuth", isHandlingAuth);
  if (!isHandlingAuth) {
    return null;
  }

  if (!hasCompletedAuth) {
    return <p>Authorizing {label}</p>;
  }

  return <p>{label} Authorization Complete</p>;
}
