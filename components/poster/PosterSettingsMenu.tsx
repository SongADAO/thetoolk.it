"use client";

import { DropdownMenu, ScrollArea } from "radix-ui";
import { ReactNode } from "react";

import { BoxHeader } from "@/components/general/BoxHeader";
import { ButtonMenu } from "@/components/general/ButtonMenu";

interface Props {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}

function PosterSettingsMenu({ label, icon, children }: Readonly<Props>) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <ButtonMenu title={label} type="button">
          {icon}
        </ButtonMenu>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-[360px] rounded-xs border border-gray-400 border-r-black border-b-black bg-white shadow-2xl will-change-[opacity,transform] data-[side=bottom]:animate-slide-up-and-fade data-[side=left]:animate-slide-right-and-fade data-[side=right]:animate-slide-left-and-fade data-[side=top]:animate-slide-down-and-fade lg:w-[720px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          sideOffset={0}
        >
          <BoxHeader>
            <h2 className="font-bold">{label}</h2>
          </BoxHeader>
          <ScrollArea.Root
            className="w-full overflow-hidden overscroll-contain"
            type="auto"
          >
            <ScrollArea.Viewport className="size-full max-h-[50vh] overscroll-contain">
              <div className="p-3">{children}</div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex touch-none overscroll-contain p-0.5 transition-colors duration-160 ease-out select-none hover:bg-[#e5e5e5] data-[orientation=vertical]:w-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-black before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="bg-black" />
          </ScrollArea.Root>
          <DropdownMenu.Arrow className="fill-gray-600" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export { PosterSettingsMenu };
