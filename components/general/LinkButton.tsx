import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  target?: string;
  href: string;
  purpose?: "primary" | "secondary" | "danger";
  width?: "full" | "auto";
}

function LinkButton({
  children,
  purpose = "primary",
  width = "auto",
  ...otherProps
}: Readonly<Props>) {
  return (
    <Link
      className="cursor-pointer rounded bg-black px-4 py-2 text-white no-underline hover:bg-blue-800 disabled:opacity-50 data-[purpose=danger]:bg-red-500 data-[purpose=danger]:hover:bg-red-600 data-[width=full]:w-full"
      data-purpose={purpose}
      data-width={width}
      {...otherProps}
    >
      {children}
    </Link>
  );
}

export { LinkButton };
