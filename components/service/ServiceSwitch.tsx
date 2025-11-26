"use client";

import { NeynarAuthButton } from "@neynar/react";
import { Checkbox, Collapsible } from "radix-ui";
import { ReactNode, useEffect, useState } from "react";
import {
  FaCheck,
  FaCircleUser,
  FaGear,
  FaRegCalendarXmark,
} from "react-icons/fa6";

import type { PostServiceAccount } from "@/services/post/types";
import type { StorageServiceAccount } from "@/services/storage/types";

interface Props {
  accounts: PostServiceAccount[] | StorageServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  disconnect: () => void;
  form: ReactNode;
  hasAuthorizationStep: boolean;
  hasHostedCredentials: boolean;
  icon: ReactNode;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  mode: "server" | "browser";
  setIsEnabled: (isEnabled: boolean) => void;
}

function ServiceSwitch({
  accounts,
  authorizationExpiresAt,
  authorize,
  brandColor,
  credentialsId,
  disconnect,
  form,
  hasAuthorizationStep,
  hasHostedCredentials,
  icon,
  isAuthorized,
  isComplete,
  isEnabled,
  label,
  mode,
  setIsEnabled,
}: Readonly<Props>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const startOpen = !isComplete && isEnabled;

  const [open, setOpen] = useState(startOpen);

  useEffect(() => {
    if (isEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(!isComplete);
    } else {
      setOpen(false);
    }
  }, [isEnabled, isComplete, credentialsId]);

  const hasCredentials = Boolean(mode === "browser" || hasHostedCredentials);

  const needsCredentials = Boolean(isEnabled && !isComplete);

  return (
    <div className="flex flex-col gap-1">
      <Collapsible.Root
        className={`group rounded-xs border border-gray-400 border-r-black border-b-black bg-gray-200 data-[enabled=yes]:text-white data-[enabled=yes]:bg-brand-${brandColor}`}
        data-enabled={isEnabled ? "yes" : "no"}
        disabled={needsCredentials}
        onOpenChange={setOpen}
        open={Boolean(needsCredentials || open)}
      >
        <div
          className={`flex items-center justify-between rounded-xs p-2 text-black group-data-[enabled=yes]:text-white group-data-[enabled=yes]:bg-brand-${brandColor}`}
        >
          <Checkbox.Root
            checked={isEnabled}
            className="flex size-10 cursor-pointer appearance-none items-center justify-center rounded-xs border border-black bg-white outline-none hover:bg-blue-100"
            id={`service-switch-${label}`}
            onCheckedChange={(checked) => setIsEnabled(Boolean(checked))}
          >
            <Checkbox.Indicator
              className={`group-data-[enabled=yes]:text-brand-${brandColor} text-black`}
            >
              <FaCheck className="size-6" />
            </Checkbox.Indicator>
          </Checkbox.Root>

          <label
            className="group flex min-h-9 flex-1 cursor-pointer items-center justify-between rounded-xs px-2 py-1 pl-4 outline-none"
            htmlFor={`service-switch-${label}`}
          >
            <span className="flex items-center gap-x-2">
              {icon} {label}
            </span>
          </label>

          {hasCredentials ? (
            <Collapsible.Trigger
              className="ml-4 flex size-10 cursor-pointer items-center justify-center rounded-xs border border-black bg-white text-black data-[clickable=true]:hover:bg-gray-200"
              data-clickable={needsCredentials ? "false" : "true"}
              disabled={needsCredentials}
            >
              <FaGear
                aria-hidden
                className="transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180"
              />
            </Collapsible.Trigger>
          ) : null}
        </div>

        {hasCredentials ? (
          <Collapsible.Content className="overflow-hidden">
            <div className="m-2 mt-0 rounded-xs border border-gray-600 border-r-black border-b-black bg-[#fff2] p-2">
              {form}
            </div>
          </Collapsible.Content>
        ) : null}

        {isClient &&
        hasAuthorizationStep &&
        isComplete &&
        (isEnabled || (isAuthorized && accounts.length > 0)) ? (
          <div className="gap-2 bg-[#fff2] p-2">
            <div className="space-y-2">
              {isAuthorized && accounts.length > 0 ? (
                <div className="flex items-center justify-between gap-2">
                  {accounts.map((account) => (
                    <div
                      className="flex items-center gap-1 text-sm"
                      key={account.id}
                    >
                      <FaCircleUser className="size-4" />{" "}
                      {account.username}{" "}
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
              ) : null}

              {isEnabled || (isAuthorized && accounts.length > 0) ? (
                <div className="flex items-center justify-between gap-2">
                  {label === "Farcaster" ? (
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
                  ) : (
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>
                      {isAuthorized && accounts.length > 0 ? (
                        <div className="flex-1">
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
                        </div>
                      ) : (
                        <div className="flex-1">
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
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Collapsible.Root>
    </div>
  );
}

export { ServiceSwitch };
