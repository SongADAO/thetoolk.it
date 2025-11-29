"use client";

import { Checkbox, Collapsible } from "radix-ui";
import { ReactNode, useEffect, useState } from "react";
import { FaCheck, FaGear } from "react-icons/fa6";

import { ServiceSwitchAuthButton } from "@/components/service/ServiceSwitchAuthButton";
import { ServiceSwitchUser } from "@/components/service/ServiceSwitchUser";
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

  const canAuthorize = isClient && hasAuthorizationStep && isComplete;

  const hasAuthorizedAccounts = isAuthorized && accounts.length > 0;

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

          {hasCredentials || hasAuthorizedAccounts ? (
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

        {hasCredentials || hasAuthorizedAccounts ? (
          <Collapsible.Content className="overflow-hidden">
            {hasCredentials ? (
              <div className="m-2 mt-0 rounded-xs border border-gray-600 border-r-black border-b-black bg-[#fff2] p-2">
                {form}
              </div>
            ) : null}

            {hasAuthorizedAccounts ? (
              <div className="m-2 mt-0">
                <ServiceSwitchAuthButton
                  accounts={accounts}
                  authorize={authorize}
                  disconnect={disconnect}
                  icon={icon}
                  isAuthorized={isAuthorized}
                  label={label}
                />
              </div>
            ) : null}
          </Collapsible.Content>
        ) : null}

        {canAuthorize ? (
          <div className="bg-[#fff2]">
            {hasAuthorizedAccounts ? (
              <div className="p-2">
                <ServiceSwitchUser
                  accounts={accounts}
                  authorizationExpiresAt={authorizationExpiresAt}
                />
              </div>
            ) : null}

            {!hasAuthorizedAccounts && (hasCredentials || isEnabled) ? (
              <div className="p-2">
                <ServiceSwitchAuthButton
                  accounts={accounts}
                  authorize={authorize}
                  disconnect={disconnect}
                  icon={icon}
                  isAuthorized={isAuthorized}
                  label={label}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </Collapsible.Root>
    </div>
  );
}

export { ServiceSwitch };
