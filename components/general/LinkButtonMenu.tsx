import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  href: string;
  purpose?: "primary" | "secondary" | "danger";
  target?: string;
  title?: string;
  width?: "full" | "auto";
}

function LinkButtonMenu({
  children,
  purpose = "primary",
  width = "auto",
  ...otherProps
}: Readonly<Props>) {
  return (
    <Link
      className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-xs bg-black p-3 font-semibold text-white no-underline hover:bg-blue-800 disabled:opacity-50 data-[purpose=danger]:bg-red-700 data-[purpose=danger]:hover:bg-red-600 data-[width=full]:w-full"
      data-purpose={purpose}
      data-width={width}
      {...otherProps}
    >
      {children}
    </Link>
  );
}

export { LinkButtonMenu };
