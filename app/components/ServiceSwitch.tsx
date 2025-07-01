"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Accordion, Checkbox } from "radix-ui";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  brandColor: string;
  children: ReactNode;
  configId: string;
  icon: ReactNode;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  setIsEnabled: (isEnabled: boolean) => void;
}

function ServiceSwitch({
  brandColor,
  children,
  configId,
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
  }, [isEnabled, isComplete, configId]);

  return (
    <Accordion.Root
      className="w-[300px] rounded bg-gray-300 shadow-[0_2px_10px] shadow-black/5"
      collapsible
      onValueChange={(value: string) => setIsOpen(value === "open")}
      type="single"
      value={isOpen ? "open" : "closed"}
    >
      <Accordion.Item value="open">
        <div
          className={`grid grid-cols-[40px_1fr] items-center justify-between rounded bg-gray-400 p-2 data-[enabled=yes]:bg-brand-${brandColor}`}
          data-enabled={isEnabled ? "yes" : "no"}
        >
          <Checkbox.Root
            checked={isEnabled}
            className="shadow-blackA4 hover:bg-violet3 flex size-[25px] appearance-none items-center justify-center rounded bg-white shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px_black]"
            id="c1"
            onCheckedChange={(checked) => setIsEnabled(Boolean(checked))}
          >
            <Checkbox.Indicator className="text-violet11">
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox.Root>

          <Accordion.Trigger className="group flex flex-1 cursor-pointer items-center justify-between px-5 outline-none">
            <span className="flex items-center gap-x-2">
              {icon} {label}
            </span>

            <ChevronDownIcon
              aria-hidden
              className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
            />
          </Accordion.Trigger>
        </div>
        <Accordion.Content className="data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden">
          <div className="px-5 py-[15px]">{children}</div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export { ServiceSwitch };
