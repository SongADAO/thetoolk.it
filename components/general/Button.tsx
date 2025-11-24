import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type: "submit" | "reset" | "button" | undefined;
  purpose?: "primary" | "secondary" | "danger";
  width?: "full" | "auto";
}

function Button({
  children,
  disabled = false,
  type,
  purpose = "primary",
  width = "auto",
  ...otherProps
}: Readonly<Props>) {
  return (
    <button
      className="cursor-pointer rounded bg-black px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-50 data-[purpose=danger]:bg-red-500 data-[purpose=danger]:hover:bg-red-600 data-[width=full]:w-full"
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

export { Button };
