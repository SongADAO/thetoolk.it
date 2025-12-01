import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  href: string;
  isActive?: boolean;
  purpose?: "primary" | "secondary" | "danger";
  target?: string;
  title?: string;
  width?: "full" | "auto";
}

function LinkButtonMenu({
  children,
  isActive = false,
  purpose = "primary",
  width = "auto",
  ...otherProps
}: Readonly<Props>) {
  return (
    <Link
      className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-xs border border-gray-400 border-r-black border-b-black bg-white p-3 font-semibold text-black no-underline hover:bg-black hover:text-white disabled:opacity-50 data-[is-active=true]:bg-black data-[is-active=true]:text-white data-[purpose=danger]:bg-red-700 data-[purpose=danger]:hover:bg-red-600 data-[width=full]:w-full"
      data-is-active={isActive}
      data-purpose={purpose}
      data-width={width}
      {...otherProps}
    >
      {children}
    </Link>
  );
}

export { LinkButtonMenu };
