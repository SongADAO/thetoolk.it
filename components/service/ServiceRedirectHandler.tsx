"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { Spinner } from "@/components/general/Spinner";

interface Props {
  error: string;
  handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
  hasCompletedAuth: boolean;
  icon: ReactNode;
  isHandlingAuth: boolean;
  label: string;
  isLoading: boolean;
}

function ServiceRedirectHandler({
  error,
  handleAuthRedirect,
  hasCompletedAuth,
  icon,
  isHandlingAuth,
  label,
  isLoading,
}: Readonly<Props>) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleAuthRedirect(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading]);

  if (!isHandlingAuth) {
    return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="mb-8 flex flex-col items-center justify-center gap-2 text-xl">
          {icon} {label}
        </h1>

        {hasCompletedAuth ? (
          <>
            {error ? (
              <p className="text-[#f00]">Failed to Authorize</p>
            ) : (
              <p className="">Authorization Complete</p>
            )}
            <div className="flex items-center justify-center">
              <button
                className="mt-4 cursor-pointer rounded-xs bg-gray-500 px-4 py-2 text-white"
                onClick={() => window.close()}
                type="button"
              >
                Return to TheToolk.it
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-6">Authorizing TheToolk.it</p>
            <div className="flex items-center justify-center">
              <Spinner color="black" size="8" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { ServiceRedirectHandler };
