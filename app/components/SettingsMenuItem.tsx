"use client";

import { DropdownMenu, ScrollArea } from "radix-ui";
import { ReactNode } from "react";

interface Props {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}

function SettingsMenuItem({ label, icon, children }: Readonly<Props>) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={label}
          className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-white px-4 py-2 text-black outline-none hover:bg-gray-300"
          title={label}
          type="button"
        >
          {icon}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-[360px] rounded-md bg-gray-600 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slide-up-and-fade data-[side=left]:animate-slide-right-and-fade data-[side=right]:animate-slide-left-and-fade data-[side=top]:animate-slide-down-and-fade"
          onPointerDownOutside={(e) => e.preventDefault()}
          sideOffset={5}
        >
          <ScrollArea.Root
            className="w-full overflow-hidden overscroll-contain"
            type="auto"
          >
            <ScrollArea.Viewport className="size-full max-h-[70vh] overscroll-contain rounded p-3">
              {children}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex touch-none overscroll-contain p-0.5 transition-colors duration-[160ms] ease-out select-none hover:bg-[#e5e5e5] data-[orientation=vertical]:w-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-[#000] before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="bg-blackA5" />
          </ScrollArea.Root>
          <DropdownMenu.Arrow className="fill-gray-600" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export { SettingsMenuItem };
