import { NeynarAuthButton } from "@neynar/react";
import { ReactNode } from "react";

import type { ServiceAccount } from "@/app/services/post/types";

interface Props {
  accounts: ServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  icon: ReactNode;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
}

function ServiceAuthorize({
  accounts,
  authorizationExpiresAt,
  authorize,
  icon,
  isAuthorized,
  isComplete,
  isEnabled,
  label,
}: Readonly<Props>) {
  if (!isComplete || !isEnabled) {
    return null;
  }

  if (label === "Farcaster") {
    return <NeynarAuthButton label="Sign in with Farcaster" />;
  }

  return (
    <div>
      <button
        className="w-full cursor-pointer gap-2 rounded bg-[#080] px-2 py-2 text-white hover:bg-black data-[authorized]:bg-gray-500 data-[authorized]:hover:bg-black"
        data-authorized={isAuthorized}
        onClick={authorize}
        type="button"
      >
        <div>
          <div className="flex items-center justify-center gap-2">
            {isAuthorized ? "Reauthorize" : "Authorize"} {icon} {label}
          </div>
          {isAuthorized && authorizationExpiresAt ? (
            <>
              {accounts.map((account) => (
                <div className="text-center text-sm" key={account.id}>
                  {account.username}{" "}
                  <span className="text-sm">
                    - expires{" "}
                    {new Date(authorizationExpiresAt).toLocaleString("en", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </button>

      {/* {isAuthorized && authorizationExpiresAt ? (
        <div className="text-center text-sm">
          Authorization Expires:{" "}
          {new Date(authorizationExpiresAt).toLocaleString()}
        </div>
      ) : null} */}
    </div>
  );
}

export { ServiceAuthorize };
