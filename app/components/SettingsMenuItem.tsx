"use client";

import { DropdownMenu } from "radix-ui";
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
          aria-label="Customise options"
          className="text-violet11 shadow-blackA4 hover:bg-violet3 flex inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          title={label}
          type="button"
        >
          {icon}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade min-w-[220px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform]"
          onPointerDownOutside={(e) => e.preventDefault()}
          sideOffset={5}
        >
          {children}
          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export { SettingsMenuItem };
