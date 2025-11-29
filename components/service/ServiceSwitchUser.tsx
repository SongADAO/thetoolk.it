"use client";

import { FaCircleUser, FaRegCalendarXmark } from "react-icons/fa6";

import type { PostServiceAccount } from "@/services/post/types";
import type { StorageServiceAccount } from "@/services/storage/types";

interface Props {
  accounts: PostServiceAccount[] | StorageServiceAccount[];
  authorizationExpiresAt: string;
}

function ServiceSwitchUser({
  accounts,
  authorizationExpiresAt,
}: Readonly<Props>) {
  return (
    <div className="flex items-center justify-between gap-2">
      {accounts.map((account) => (
        <div className="flex items-center gap-1 text-sm" key={account.id}>
          <FaCircleUser className="size-4" /> {account.username}{" "}
        </div>
      ))}
      {authorizationExpiresAt ? (
        <div className="flex items-center gap-1 text-sm">
          <FaRegCalendarXmark className="size-4" />{" "}
          {new Date(authorizationExpiresAt).toLocaleString("en", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })}
        </div>
      ) : null}
    </div>
  );
}

export { ServiceSwitchUser };
