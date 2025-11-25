import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function BoxHeader({ children }: Readonly<Props>) {
  return (
    <header className="flex items-center justify-between border-b border-gray-400 bg-gray-300 px-4 py-2 pr-2">
      {children}
    </header>
  );
}

export { BoxHeader };
