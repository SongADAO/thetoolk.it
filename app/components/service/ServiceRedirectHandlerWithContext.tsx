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

  if (!isHandlingAuth) {
    return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <p>{label} Authorization</p>

        {hasCompletedAuth ? (
          <>
            <p>Authorization Complete</p>
            <div>
              <button
                className="mt-4 cursor-pointer rounded bg-gray-500 px-4 py-2 text-white"
                onClick={() => window.close()}
                type="button"
              >
                Return to TheToolk.it
              </button>
            </div>
          </>
        ) : (
          <p>Authorizing...</p>
        )}
      </div>
    </div>
  );
}
