import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  purpose?: "primary" | "secondary" | "danger";
  title?: string;
  type: "submit" | "reset" | "button" | undefined;
  width?: "full" | "auto";
}

function ButtonMenu({
  children,
  disabled = false,
  purpose = "primary",
  type,
  width = "auto",
  ...otherProps
}: Readonly<Props>) {
  return (
    <button
      className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-xs border border-gray-400 border-r-black border-b-black bg-white p-3 font-semibold text-black no-underline hover:bg-black hover:text-white disabled:opacity-50 data-[purpose=danger]:bg-red-700 data-[purpose=danger]:hover:bg-red-600 data-[width=full]:w-full"
      data-purpose={purpose}
      data-width={width}
      disabled={disabled}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...otherProps}
    >
      {children}
    </button>
  );
}

export { ButtonMenu };
