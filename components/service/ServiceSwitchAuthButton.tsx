"use client";

import { NeynarAuthButton } from "@neynar/react";
import { ReactNode } from "react";

import type { PostServiceAccount } from "@/services/post/types";
import type { StorageServiceAccount } from "@/services/storage/types";

interface Props {
  accounts: PostServiceAccount[] | StorageServiceAccount[];
  authorize: () => void;
  disconnect: () => void;
  icon: ReactNode;
  isAuthorized: boolean;
  label: string;
}

function ServiceSwitchAuthButton({
  accounts,
  authorize,
  disconnect,
  icon,
  isAuthorized,
  label,
}: Readonly<Props>) {
  if (label === "Farcaster") {
    return (
      <NeynarAuthButton
        icon={icon}
        label={`Log in with ${label}`}
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.25rem",
          boxShadow:
            "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px",
          color: "#000",
          fontWeight: "400",
          gap: "0.25rem",
          padding: "0.64rem 0.2rem",
          width: "100%",
        }}
      />
    );
  }

  if (isAuthorized && accounts.length > 0) {
    return (
      <button
        className="w-full cursor-pointer gap-2 rounded-xs bg-white px-4 py-2 text-black shadow-md hover:bg-gray-900 hover:text-white"
        data-authorized={isAuthorized}
        onClick={disconnect}
        type="button"
      >
        <div>
          <div className="flex items-center justify-center gap-2">
            {icon} Log out of {label}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      className="w-full cursor-pointer gap-2 rounded-xs bg-white px-4 py-2 text-black shadow-md hover:bg-gray-900 hover:text-white"
      data-authorized={isAuthorized}
      onClick={authorize}
      type="button"
    >
      <div>
        <div className="flex items-center justify-center gap-2">
          {icon} Log in with {label}
        </div>
      </div>
    </button>
  );
}

export { ServiceSwitchAuthButton };
