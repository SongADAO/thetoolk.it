"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Accordion, Checkbox } from "radix-ui";
import { ReactNode, useEffect, useState } from "react";
import { FaGear } from "react-icons/fa6";

interface Props {
  brandColor: string;
  credentialsId: string;
  form: ReactNode;
  icon: ReactNode;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  setIsEnabled: (isEnabled: boolean) => void;
}

function ServiceSwitch({
  brandColor,
  credentialsId,
  form,
  icon,
  isComplete,
  isEnabled,
  label,
  setIsEnabled,
}: Readonly<Props>) {
  const startOpen = !isComplete && isEnabled;

  const [isOpen, setIsOpen] = useState(startOpen);

  useEffect(() => {
    if (isEnabled) {
      setIsOpen(!isComplete);
    } else {
      setIsOpen(false);
    }
  }, [isEnabled, isComplete, credentialsId]);

  const needsCredentials = isEnabled && !isComplete;

  return (
    <Accordion.Root
      className={`group rounded bg-gray-300 data-[enabled=yes]:text-brand-${brandColor}-inverse data-[enabled=yes]:bg-brand-${brandColor}`}
      collapsible={!needsCredentials}
      data-enabled={isEnabled ? "yes" : "no"}
      onValueChange={(value: string) => setIsOpen(value === "open")}
      type="single"
      value={needsCredentials || isOpen ? "open" : "closed"}
    >
      <Accordion.Item value="open">
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
              <CheckIcon className="size-8" />
            </Checkbox.Indicator>
          </Checkbox.Root>

          <Accordion.Trigger className="group flex min-h-[36px] flex-1 cursor-pointer items-center justify-between rounded bg-[#fff2] px-2 py-1 outline-none hover:bg-[#fff4]">
            <span className="flex items-center gap-x-2">
              {icon} {label}
            </span>

            {needsCredentials ? null : (
              <FaGear
                aria-hidden
                className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
              />
            )}
          </Accordion.Trigger>
        </div>
        <Accordion.Content className="data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden">
          <div className="m-2 mt-0 rounded bg-[#fff2] p-2">{form}</div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export { ServiceSwitch };
