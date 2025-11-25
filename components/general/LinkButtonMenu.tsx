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
      className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-sm bg-gray-500 px-4 py-3 font-bold text-white outline-none hover:bg-gray-800"
      data-purpose={purpose}
      data-width={width}
      {...otherProps}
    >
      {children}
    </Link>
  );
}

export { LinkButtonMenu };
