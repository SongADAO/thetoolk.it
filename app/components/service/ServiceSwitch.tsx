"use client";

import { Checkbox, Collapsible } from "radix-ui";
import { ReactNode, useEffect, useState } from "react";
import { FaCheck, FaGear } from "react-icons/fa6";

import type { ServiceAccount } from "@/app/services/post/types";

interface Props {
  accounts: ServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  form: ReactNode;
  icon: ReactNode;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  hasAuthorizationStep: boolean;
  setIsEnabled: (isEnabled: boolean) => void;
}

function ServiceSwitch({
  accounts,
  authorizationExpiresAt,
  authorize,
  brandColor,
  credentialsId,
  form,
  icon,
  isAuthorized,
  isComplete,
  isEnabled,
  label,
  hasAuthorizationStep,
  setIsEnabled,
}: Readonly<Props>) {
  const startOpen = !isComplete && isEnabled;

  const [open, setOpen] = useState(startOpen);

  useEffect(() => {
    if (isEnabled) {
      setOpen(!isComplete);
    } else {
      setOpen(false);
    }
  }, [isEnabled, isComplete, credentialsId]);

  const needsCredentials = isEnabled && !isComplete;

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
          className="flex size-[36px] cursor-pointer appearance-none items-center justify-center rounded bg-white outline-none hover:bg-gray-200"
          id="c1"
          onCheckedChange={(checked) => setIsEnabled(Boolean(checked))}
        >
          <Checkbox.Indicator
            className={`group-data-[enabled=yes]:text-brand-${brandColor} text-black`}
          >
            <FaCheck className="size-6" />
          </Checkbox.Indicator>
        </Checkbox.Root>

        <Collapsible.Trigger className="group flex min-h-[36px] flex-1 cursor-pointer items-center justify-between rounded bg-[#fff2] px-2 py-1 outline-none hover:bg-[#fff4]">
          <span className="flex items-center gap-x-2">
            {icon} {label}
          </span>

          {needsCredentials ? null : (
            <FaGear
              aria-hidden
              className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
            />
          )}
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content className="data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden">
        <div className="m-2 mt-0 rounded bg-[#fff2] p-2">{form}</div>
      </Collapsible.Content>

      {hasAuthorizationStep && isComplete ? (
        <div className="flex items-center justify-between gap-2 bg-[#fff2] p-2">
          {isAuthorized && accounts.length > 0 ? (
            <div className="flex-1">
              {accounts.map((account) => (
                <div className="text-sm" key={account.id}>
                  @{account.username}{" "}
                </div>
              ))}
              {authorizationExpiresAt ? (
                <div className="text-sm">
                  expires:{" "}
                  {new Date(authorizationExpiresAt).toLocaleString("en", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="flex-1">
            <button
              className={`w-full cursor-pointer gap-2 rounded bg-white px-4 py-2 text-black hover:bg-gray-900 hover:text-white group-data-[enabled=yes]:text-brand-${brandColor}`}
              data-authorized={isAuthorized}
              onClick={authorize}
              type="button"
            >
              <div>
                <div className="flex items-center justify-center gap-2">
                  {isAuthorized && accounts.length > 0
                    ? "Reauthorize"
                    : "Authorize"}
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : null}
    </Collapsible.Root>
  );
}

export { ServiceSwitch };
