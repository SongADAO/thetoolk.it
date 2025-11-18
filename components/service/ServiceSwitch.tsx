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
  mode: "hosted" | "self";
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

  const hasCredentials = Boolean(mode === "self" || hasHostedCredentials);

  const needsCredentials = Boolean(isEnabled && !isComplete);

  return (
    <Collapsible.Root
      className={`group rounded bg-gray-300 data-[enabled=yes]:text-brand-${brandColor}-inverse data-[enabled=yes]:bg-brand-${brandColor}`}
      data-enabled={isEnabled ? "yes" : "no"}
      disabled={needsCredentials}
      onOpenChange={setOpen}
      open={Boolean(needsCredentials || open)}
    >
      <div
        className={`flex items-center justify-between gap-2 rounded p-2 text-black group-data-[enabled=yes]:text-brand-${brandColor}-inverse group-data-[enabled=yes]:bg-brand-${brandColor}`}
      >
        <Checkbox.Root
          checked={isEnabled}
          className="flex size-9 cursor-pointer appearance-none items-center justify-center rounded bg-white outline-none hover:bg-gray-200"
          id="c1"
          onCheckedChange={(checked) => setIsEnabled(Boolean(checked))}
        >
          <Checkbox.Indicator
            className={`group-data-[enabled=yes]:text-brand-${brandColor} text-black`}
          >
            <FaCheck className="size-6" />
          </Checkbox.Indicator>
        </Checkbox.Root>

        <Collapsible.Trigger
          className="group flex min-h-9 flex-1 items-center justify-between rounded bg-[#fff2] px-2 py-1 outline-none data-[clickable=true]:cursor-pointer data-[clickable=true]:hover:bg-[#fff4]"
          data-clickable={
            hasCredentials && !needsCredentials ? "true" : "false"
          }
          disabled={hasCredentials ? needsCredentials : false}
        >
          <span className="flex items-center gap-x-2">
            {icon} {label}
          </span>

          {hasCredentials ? (
            <FaGear
              aria-hidden
              className="transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180"
            />
          ) : null}
        </Collapsible.Trigger>
      </div>

      {hasCredentials ? (
        <Collapsible.Content className="overflow-hidden">
          <div className="m-2 mt-0 rounded bg-[#fff2] p-2">{form}</div>
        </Collapsible.Content>
      ) : null}

      {isClient && hasAuthorizationStep && isComplete ? (
        <div className="gap-2 bg-[#fff2] p-2">
          {isAuthorized && accounts.length > 0 ? (
            <div className="flex items-center justify-between gap-2 pb-2">
              {accounts.map((account) => (
                <div
                  className="flex items-center gap-1 text-sm"
                  key={account.id}
                >
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
          ) : null}

          <div className="flex items-center justify-between gap-2">
            {label === "Farcaster" ? (
              <NeynarAuthButton
                label="Log in with Neynar"
                style={{
                  borderRadius: "0.25rem",
                  boxShadow:
                    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px",
                  fontWeight: "400",
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
                      className={`w-full cursor-pointer gap-2 rounded bg-white px-4 py-2 text-black hover:bg-gray-900 hover:text-white group-data-[enabled=yes]:text-brand-${brandColor} shadow-md`}
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
                      className={`w-full cursor-pointer gap-2 rounded bg-white px-4 py-2 text-black hover:bg-gray-900 hover:text-white group-data-[enabled=yes]:text-brand-${brandColor} shadow-md`}
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
        </div>
      ) : null}
    </Collapsible.Root>
  );
}

export { ServiceSwitch };
